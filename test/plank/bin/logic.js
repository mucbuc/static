var assert = require( 'assert' )
  , Promise = require( 'promise' ) 
  , Printer = require( './printer' )
  , fs = require( 'graceful-fs' );

function Logic(base) {

  this.traverse = function(o) {
    return new Promise(function(resolve, reject) {
        try {
          fs.exists( o.testDir, function(exists) {
            if (exists) { 
              resolve( o ); 
            }
            else {
              Printer.cursor.red();
              process.stdout.write( 'invalid test definition path: ');
              Printer.cursor.reset();
              reject();
            }
          });
        }
        catch(e)
        {
          Printer.printError( e );
          throw(e);
        } 
      });

  };

  this.generate = function(o) {
    return new Promise(function(resolve, reject) {
      Printer.begin( o.defFile, 'generate' );
      try {
        base.generate( o, function( exitCode, buildDir){
          //o['buildDir'] = buildDir;
          o['testDir'] = o.testDir;
          if (!exitCode) {
            Printer.finishGreen( o.defFile, 'generate' );
            resolve(o);
          }
          else {
            Printer.finishRed( o.defFile ) ; 
            reject(o); 
          }
        });
      }
      catch( e ) 
      {
        Printer.printError( e );
        throw( e );
      }
    });
  };

  this.build = function(o) {
    return new Promise( function(resolve, reject) {
      Printer.begin( o.defFile, 'build' );
      
      try {    
        base.build( o, function( o ) { 
          if (!o.exitCode) {
            Printer.finishGreen( o.defFile );
            resolve( o );
          }
          else {
            Printer.finishRed( o.defFile );
            reject(o); 
          }
        });
      }
      catch(e) 
      {
        Printer.printError( e );
        throw e;
      }
    });
  };

  this.run = function(o) {
    return new Promise(function(resolve, reject) {
      Printer.begin( o.defFile, 'run' );
      try {
        base.run( o, function(exitCode) {
          o['exitCode'] = exitCode;
          if (!exitCode) {
            Printer.finishGreen( o.defFile );
            resolve(o);
          }
          else {
            Printer.finishRed( o.defFile ) ; 
            reject(o);
          }
        });
      }
      catch(e) {
        Printer.printError(e);
        throw e;
      }
    });
  }; 
};

module.exports = Logic;