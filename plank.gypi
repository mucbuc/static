{
    'target_defaults': {
    	'default_configuration': 'Release',
		'configurations':{
	       'Release': {
	         'defines': [
	           'NDEBUG',
	         ],
	       },
	       'Debug': {
	       },
	    },
        'sources': [
            'src/assert.cpp',
            'src/assert.h',
            'src/assert.hxx',
        ]
    }
}