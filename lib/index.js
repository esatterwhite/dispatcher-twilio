/*jshint laxcomma: true, smarttabs: true*/
/*globals module,process,require,exports,__dirname,__filename */
'use strict';
/**
 * index.js
 * @module index.js
 * @author 
 * @since 0.0.1
 * @requires dispatch-twilio/lib/parser
 * @requires dispatch-twilio/lib/region
 * @requires mout/number/toInt
 */

var Parser = require( './parser' )
  , Region = require( './region' )
  , toInt = require( 'mout/number/toInt' )
  ;

var parser = new Parser();

// worst. function name. ever.
exports.purchasePhoneNumberAsync = function( opts ){
	opts = opts || {};
	var region 
	var p = parser
				.parse( opts.nearPhoneNumber )
				.then(function( data ){
					region = new Region( toInt(data.area) );
					return region.number();	
				})
				.then(function( number ){
					return region.purchase( number.phone_number )
				})
	return p
};
