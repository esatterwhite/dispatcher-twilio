/*jshint laxcomma: true, smarttabs: true*/
/*globals module,process,require,exports,__dirname,__filename */
'use strict';
/**
 * provides a baseline number parser
 * @module dispatch-twilio/lib/parser
 * @author Eric Sattewrhite
 * @since 1.0.0
 * @requires events
 * @requires util
 * @requires bluebird
 * @requires bluebird
 * @requires dispatcher-twilio/lib/class
 * @requires dispatcher-twilio/lib/options
 * @requires dispatcher-twilio/lib/parent
 */

var events    = require( 'events' )
  , util      = require( 'util')
  , Promise   = require('bluebird')
  , Exception = require('./exception')
  , Class     = require( './class' )
  , Options   = require( './class/options' )
  , Parent    = require( './class/parent' )
  , Parser
  ;

/**
 * Represents the primary parts of a phone number
 * @typedef {Object} PhoneNumber
 * @property {String} area 
 * @property {String} prefix
 * @property {String} suffix
 **/

/**
 * @alias module:dispatcher-twilio/lib/parser
 * @param {Object} [options]
 * @param {Object} [options.expression=/(?:[1]{1})?((\d{3})(?:\s?\))?)(?:\D*)?(\d{3})(?:\D*)?(\d{4})/]
 * @example var x = new Parser().parse('+14144915548');
 * @example var x = new Parser().parse('+14144915548');
 */
Parser = new Class({
	inherits: events.EventEmitter
	,mixin: [ Options, Parent ]
	,options:{
  		expression:/(?:[1]{1})?((\d{3})(?:\s?\))?)(?:\D*)?(\d{3})(?:\D*)?(\d{4})/
	}
	,constructor: function( options ){
		this.setOptions( options );
    }

    /**
     * parses something that looks like a phone number into uniform parts
     * @method module:dispatcher-twilio/lib/parser#parse
     * @param {String} number Phone number to parse
     * @return {PhoneNumber} data
     **/
	,parse: function( number ){
		var that = this;
		return new Promise(function(resolve, reject){
			var bits;
			bits = that.options.expression.exec( number );

			if( !bits ){
				reject(new Exception({
					name:'InvalidPhoneNumberError'
					,message:util.format( 'Numbers must conform to E164 specifications. %s provided', number)
				}));
			}

			resolve({
				area:bits[2]
			  , prefix:bits[3]
			  , suffix:bits[4]
			});
		})
	}
});

module.exports = Parser;
