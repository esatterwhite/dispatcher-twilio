/*jshint laxcomma: true, smarttabs: true, node: true*/
'use strict';
/**
 * Configuration loader
 * @module dispatch-twilio/conf
 * @author Eric Satterwhite 
 * @since 0.0.1
 * @requires nconf
 * @requires fs
 * @requires util
 */

var util = require( 'util' )
  , fs = require( 'fs' )
  , nconf = require( 'nconf' )
  , defaults = require( './defaults' )
  , conf
  ;

conf = nconf
			.argv()
			.env({separator:'__'})
			.defaults( defaults )

module.exports = conf;
