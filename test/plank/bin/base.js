
var assert = require( 'assert' )
  , path = require( 'path' )
  , cp = require( 'child_process' )
  , copy = require( 'fs-extra' ).copy
  , fs = require( 'graceful-fs' )
  , Printer = require( './printer' );

assert( typeof copy === 'function' );

function Base(program) {

  this.readSuites = function(suite, cb) {
    fs.readFile( suite, function(err, data) {
      if (err) throw err; 
      cb( JSON.parse( data.toString() ).tests );
    });
  }; 

  this.generate = function( o, cb ) {

    assert( o.hasOwnProperty( 'output' ) );
    assert( o.hasOwnProperty( 'testDir' ) );
    assert( o.hasOwnProperty( 'defFile' ) );

    makePathIfNone(o.output, function() {

      var include = program.gcc ? 'plank/def/cpp11-gcc.gypi' : 'plank/def/cpp11.gypi'
        , args = [
          o.defFile,
          '--depth=' + (program.gcc ? './' : '.'),
          '--generator-output=' + o.output,
          '--include=' + include  
        ];

      if (program.gcc) {
        args.push( '--format=make' );
      }

      console.log( args );

      cp.spawn( 
        'gyp', 
        args, {
          stdio: 'inherit',
          cwd: o.testDir
        })
      .on( 'close', function( code ) {
        cb( code, o.output );
      });
    });

    function makePathIfNone( path, cb ) {
      fs.exists(path, function(exists) {
        if (exists) 
          cb();
        else 
          fs.mkdir( path, [], cb ); 
      });
    }
  };

  this.traverse = function( o, cb ) {
    fs.readdir( o.testDir, function( err, files ) {
      files.forEach( function( file ) {
        if (path.extname(file) == '.gyp') {
          cb( file ); 
        }
      } );    
    } );
  };

  this.build = function( o, cb ) {
    
    readTargetName( o.defFile, o.testDir, function( targetName ) { 

      var child; 
      if (program.gcc) {
        child = cp.spawn(
          'make',
          [ '-j'],
          {
            stdio: 'inherit',
            cwd: o.output
          }); 
      }
      else {

        var args = [
          "-project",
          path.join( o.output, targetName + '.xcodeproj' )
        ];

        console.log( args ); 

        child = cp.spawn( 
          'xcodebuild', 
          args, {
            cwd: o.output,
            stdio: 'inherit'
          } ); 
      }

      child.on( 'close', function( code ) {
        o['target'] = targetName;
        o['exitCode'] = code;
        cb( o ); 
      } );
    } );

    function readTargetName(defFile, testDir, cb) {
      var defPath = path.join( testDir, defFile );
      fs.readFile( defPath, function( err, data ) {
        if (err) {
          Printer.cursor.red();
          process.stdout.write( defFile + ': ' );
          Printer.cursor.reset();
          console.log( err );
        }
        else {
          var matches = data.toString().match( /'target_name'\s*:\s*'(.*)'/ )
          if (matches) {
            cb( matches[1] );
          }
        }
      } ); 
    }
  };

  this.run = function( o, cb ) {
    var execPath;
    
    if (program.gcc) {
      o.testDir = path.join( o.testDir, 'out' );
      execPath = path.join( o.output, 'out/Test', o.target );
    }
    else 
      execPath = path.join( o.output, 'Test', o.target );

    cp.spawn( 
      execPath, 
      [ 'http://localhost:3000' ], {
      stdio: 'pipe'
    })
    .on( 'error', function( error ) {
      console.log( error );
    })
    .on( 'close', function( code ) {
      cb( code );
      //server.kill();
    })
    .stdout.on( 'data', function( data ) {
      Printer.cursor.blue();
      process.stdout.write( o.defFile + ': ' ); 
      Printer.cursor.reset();
      console.log( data.toString() );
    });
  };
}

module.exports = Base;
