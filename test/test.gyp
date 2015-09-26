{
	'includes':[
		'lib/static/def.gypi',
	],#includes
	'target_defaults': {
		'target_name': 'test', 
		'type': 'executable',
		'sources': [
			'src/main.cpp',
		], #sources
		'include_dirs': [
			'.'
		], #include_dirs		
	}, #target_defaults
}