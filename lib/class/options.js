/*jshint node:true laxcomma:true, smarttabs: true */
'use strict';
/**
 * Provides a simple and standard way to include class configuration options
 * @module dispatch-twilio/class/options
 * @author Eric Satterwhite
 * @requires dispatch-twilio/class
 * @requires dispatch-twilio/object/merge
 * @requires dispatch-twilio/array/append
 * @since 0.1.0
 **/
var Class  = require( './index' )
  , merge  = require( 'mout/object/merge' )
  , append = require( 'mout/array/append' )
  , Options
  ;

function removeOn( name ){
    return name.replace(/^on([A-Z])/, function(full, first ){
        return first.toLowerCase();
    });
}

/**
 * Object class mixing which provides a standard way of defining configuration options on a class instance
 * @constructor
 * @alias module:dispatch-twilio/class/options
 * @param {Object} options and object containing configutation overrides to set on the class instance
 */
Options = new Class({
    /**
     * merges an object into existing instance options and stores them in an options property
     * @param {Objecdt} Options conifguration options to be merged into defaults
     * @returns {Object} 
     */ 
    setOptions: function( options ){
        if( !!this.addListener ){
            for( var opt in options ){

                if( typeof( options[ opt ] ) !== 'function' || !(/^on[A-z]/).test(opt)){
                    continue;
                }
                this.addListener( removeOn( opt ), options[ opt ]);
                delete options[opt];
            }
        }
        this.options = merge.apply(null, append([{}, this.options || {} ], arguments ) );
        options = this.options;
        return this;
    }
})

module.exports = Options;
