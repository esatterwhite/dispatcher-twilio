/*jshint laxcomma: true, smarttabs: true*/
/*globals module,process,require,exports,__dirname,__filename */
'use strict';
/**
 * Area code centric class to resolve state wide information
 * @module dispatch-twilio/lib/region
 * @author Eric Satterwhite
 * @since 1.0.0
 * @requires dispatch-twilio/lib/areacodes
 */

var Promise   = require( 'bluebird' )
  , events    = require( 'events' )
  , util      = require( 'util' )
  , toInt     = require( 'mout/number/toInt')
  , lowercase = require( 'mout/string/lowerCase')
  , codes     = require( './areacodes' )
  , Class     = require('./class')
  , Options   = require('./class/options')
  , Parent    = require('./class/parent')
  , Exception = require('./exception')
  , Region
  ;



/**
 * @constructor
 * @alias module:dispatch-twilio/lib/region
 * @extends EventEmitter
 * @param {Object} options
 * @fires state
 * @fires city
 * @fires code
 */
Region = new Class({
	mixin:[ Options, Parent ]
	,inherits:events.EventEmitter
	,options:{

	}
	,constructor: function( code, options ){
		this.setOptions( options )
		this.code = code;
		if(!codes.hasOwnProperty( code )){
			throw new Exception({
				name:'InvalidAreaCodeError'
				,message: util.format('%d is an invalid areacode', code)
			});
		}
	}

	/**
	 * Resolves a list of all in host state of the instance area code 
	 * @method module:dispatch-twilio/lib/region#cities
	 * @param {TYPE} NAME ...
	 * @param {TYPE} NAME ...
	 * @return {Promis}
	 **/
	,cities: function city( ){
		var that = this;

		return new Promise(function( resolve, reject ){
			var data, arr;
			arr = [];
			data = codes[ that.code ];
			that.state()
				.then( function( state ){
					Object.keys( codes )
						  .forEach( function( code ){
						  	var current = codes[ code ] 
						  	if( state === current.state ){
						  		that.emit('city', current.city );
						  		arr.push( current.city );
						  	}
						  });
					resolve( arr );
				});
		});
	}

	/**
	 * Resolves an array of the other area codes in the resident state, 
	 * @method module:dispatch-twilio/lib/region#codes
	 * @return {Promise}
	 **/
	,codes: function( ){
		var that = this;
		return new Promise(function( resolve, reject){
			var data, arr;

			arr = []
			data = codes[that.code];
			that.state()
				.then( function( state ){
					Object.keys( codes )
						.forEach( function( code ){
							var current = codes[ code ].state 
							if( state === current && code != that.code ){
								that.emit('code', code);
								arr.push( code );
							}
						});

					resolve( arr );
				})
		});	
	}

	/**
	 * resolves the resident state for the related area code
	 * @method module:dispatch-twilio/lib/region#state
	 * @param {Number} [code] the area code of the state to return. Defaults to the instance area code if not supplied
	 * @return {Promise}
	 **/
	,state: function state( code ){
		var that = this;
		return new Promise( function( resolve, reject ){
			var data, err
			data = codes[ code || that.code ];
			that.emit('state', data.state)
			resolve( data.state );
		});
	}
});
 

module.exports = Region;
