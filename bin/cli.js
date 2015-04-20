#!/usr/bin/env node
/*jshint node:true, laxcomma: true, smarttabs: true*/
'use strict';
/**
 * Command line Interface for alice. This module is here to load other management
 * commands. And that is about it.
 * @module alice.js
 * @author Eric Satterwhite
 * @since 1.9.0
 * @requires seeli
 * @requires fs
 * @requires child_process
 * @requires debug
 * @requires mout/lang/clone
 */

 var cli = require( 'seeli' )
   , child_process = require( 'child_process' )
   , fs            = require('fs')                          // fs module
   , path          = require('path')                          // fs module
   , debug         = require('debug')( 'bin:dispatch')
   , clone         = require('mout/lang/clone')
   , commandpath   = path.normalize( path.resolve(__dirname,'..','commands') )
   , jsregex       = /\.js$/
   , files
   ;

debug('current dir', __dirname);
debug('package path: %s', commandpath);


fs
	.readdirSync( commandpath )
	.forEach( function( file ){
		if( jsregex.test( file ) ){
			var requirepath = path.join( commandpath, file )
			var cmd = require(requirepath)
			var name = ((cmd.options.name ? cmd.options.name : file)).replace(jsregex,'').toLowerCase().replace('-', '_');
			try{
				debug('loading %s', requirepath)
				debug('registering %s command', file )
				cli.use( name, cmd)
				
			} catch( e ){
				debug('unable to register module %s', file )
			}
		}
	});

cli.commands.exitOnContent = true
cli.run()

