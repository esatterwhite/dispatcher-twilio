#!/usr/bin/env node
/*jshint laxcomma: true, smarttabs: true*/
/*globals module,process,require */
'use strict';
/**
 * simple test runner harness
 * @module scripts/test
 * @author Eric Satterwhite
 * @since 0.0.1
 * @requires child_process
 * @requires module:mout/lang/clone
 * @requires fs
 * @requires path
 * @requires os
 * @requires util
 */

var child_process = require('child_process')               // child proces for spawning mocha
  , fs            = require('fs')                          // fs module
  , path          = require('path')                        // path module
  , os            = require('os')                          // os module
  , util          = require("util")                        // util module
  , clone         = require('mout/lang/clone')             // object clone module
  , set           = require('mout/object/set')
  , debug         = require('debug')( 'scripts:runner')
  , env           = clone( process.env )                   // clone of current process env
  , npath         = ( env.NODE_PATH || "" ).split( path.delimiter )     // cache of node path split into an array
  , html                                                   // html stream
  , coverage                                               // mocha code coverage process
  , mocha                                                  // moacha child process
  , reporter
  ;

// add our modules director to node require path
// so we don't have to require( ../../../../../ )
npath.push(path.resolve(__dirname,'..','packages') )
npath = npath.join( path.delimiter )
env.NODE_PATH = npath  

reporter = process.stdout
process.stdout.write(os.EOL);


// fake a CI env variable for test creds
set(env,'twilio.sid', 'AC53a9a57546b1edecba8eb015f3dfd074');
set(env,'twilio.token', 'bb78371d96100b58a9268959eb0d8b55')
// spinner.start();
// spinner.stop();
mocha = child_process.spawn("mocha", [
  "--harmony"
  , "--growl"
  , "--recursive"
  // ,"--debug-brk"
  ,"--timeout=10000"
  , '--reporter=spec'
  , "test"
], { env:env });

mocha.on('exit', function( code, sig ){
  process.exit( code );
});

mocha.stdout.pipe( reporter )
mocha.stderr.pipe( reporter )
