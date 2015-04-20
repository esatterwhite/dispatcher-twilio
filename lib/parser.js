/*jshint laxcomma: true, smarttabs: true*/
/*globals module,process,require,exports,__dirname,__filename */
'use strict';
/**
 * provides a baseline number parser
 * @module dispatch-twilio/lib/parser
 * @author Eric Sattewrhite
 * @since 0.0.1
 * @requires moduleA
 * @requires moduleB
 * @requires moduleC
 */

var events = require( 'events' )
  , util = require( 'util')
  , Promise = require('bluebird')
  , Exception = require('./exception')
  , Class = require( './class' )
  , Options = require( './class/options' )
  , Parent = require( './class/parent' )
  , Parser
  ;

/**
 * Description
 * @class module:parser.js.Thing
 * @param {TYPE} param
 * @example var x = new parser.js.THING();
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
	,parse: function( number ){
		var that = this;
		return new Promise(function(resolve, reject){
			var bits;
			bits = that.options.expression.exec( number );

			if( !bits ){
				reject(new Exception({
					name:'InvalidPhoneNumberError'
					,message:util.format( 'Numbers must conform to E164 specifications. %s provides', number)
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
