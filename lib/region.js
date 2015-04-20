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
  , twilio    = require('twilio')
  , async     = require( 'async' )
  , toInt     = require( 'mout/number/toInt')
  , lowercase = require( 'mout/string/lowerCase')
  , clone     = require( 'mout/lang/clone')
  , debug     = require('debug')('dispatcher:region')
  , codes     = require( './areacodes' )
  , Class     = require('./class')
  , Options   = require('./class/options')
  , Parent    = require('./class/parent')
  , Exception = require('./exception')
  , conf      = require('../conf')
  , NoNumberFoundError
  , InvalidAreaCodeError
  , Region
  ;


NoNumberFoundError = new Class({
	inherits: Exception
	,options:{
		name:'NoNumberFound'
		,type:'no_number_found'
		,code:1001
	}
});

InvalidAreaCodeError = new Class({
	inherits: Exception
	,options:{
		name:'InvalidAreaCodeError'
		,type:'invalid_area_code'
		,code:1002
	}
});
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
		sid:conf.get('twilio:sid')
	  , token:conf.get('twilio:token')
	}
	,constructor: function( code, options ){
		this.setOptions( options )
		this.code = code;
		if(!codes.hasOwnProperty( code )){
			var e = new InvalidAreaCodeError({
				message: 'is an invalid areacode'
			});
			throw e;
		}
		this.client = twilio( this.options.sid, this.options.token );
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
	,codes: function( include ){
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

					include && arr.unshift( '' + that.code )
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

	/**
	 * attempts to find a phone number available for purchase
	 * @method module:dispatcher-twilio/lib/region#number
	 * @return {Promise}
	 **/
	,number: function number( ){
		var that = this;
		return new Promise(function( resolve, reject ){
			that.codes( true )
			    .then( function( areacodes ){
			    	var current // current area code
			    	  , found   // a number available to buy - to exit the while early

					async.whilst(
						function(){ 
							current = areacodes.shift();
							return ( !found && !!current );
						},
						function( callback ){
					    	debug('looking for numbers in %s', current);
					    	that.emit('search', current)
							that.client
								.availablePhoneNumbers("US")
								.local.get({ 
									areaCode: that.code 
								}, function(err, numbers) {

									if( err ){
										debug('number lookup failed', err)
										return callback( err )
									}
									debug('%d numbers in %s', numbers.availablePhoneNumbers.length, current )
									if( numbers.availablePhoneNumbers.length ){
										found = numbers.availablePhoneNumbers.pop();
										that.emit('number', found)
									}
									callback( null );
							});
						},
						function( err ){
							err = !found ? new NoNumberFoundError({
										message:'All area codes exhausted. No numbers available'
									}) : err

							if( err ){
								return reject( err );
							}
							debug('found a number a local in')
							that.emit('compete', found)
							resolve( found );
						}
					);
			    });
		})
	}

	/**
	 * Purchase a number
	 * @method module:dispatch-twilio/lib/region#purchase
	 * @param {String} [number] A phone number to purchase. Will default to purchasing a number near the instance area code
	 * @return {Promise}
	 **/
	,purchase: function purchase( number ){
		var that = this
		  , params;

		params = !!number ? {phoneNumber:number} : {areaCode:this.code}
		debug('purchasing number', number, params)
		return new Promise(function( resolve, reject ){
			that.client.incomingPhoneNumbers.create(params, function(err, number) { 
				debug('purchase %s', err ? 'errored' :'complete', (err||number))
				return err ? reject( err ) : resolve( number ); 
			});
		})
	}
});


module.exports = Region;
