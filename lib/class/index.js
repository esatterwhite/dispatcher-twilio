/*jshint node:true, laxcomma:true, smarttabs: true */
'use strict';
/**
 * Prototypal inheritance made easy - A slight modification on the prime libs
 * @module dispatch-twilio/class
 * @author Eric Satterwhite
 * @requires mout/object/hasOwn
 * @requires mout/object/mixIn
 * @requires mout/object/merge
 * @requires mout/lang/createObject
 * @requires mout/lang/clone
 * @requires mout/lang/isObject
 * @requires mout/lang/kindOf
 * @requires mout/string/lowerCase
 **/
var hasOwn    = require('mout/object/hasOwn')
  , mixIn     = require('mout/object/mixIn')
  , merge     = require('mout/object/merge')
  , create    = require('mout/lang/createObject')
  , clone     = require('mout/lang/clone')
  , isObject  = require('mout/lang/isObject')
  , kindOf    = require('mout/lang/kindOf')
  , lowerCase = require('mout/string/lowerCase')
  , mutators  = {}
  , type
  ;

type = function( obj ){
    return lowerCase( kindOf( obj ) );
}

var hasDescriptors = true

try {
    Object.defineProperty({}, "~", {})
    Object.getOwnPropertyDescriptor({}, "~")
} catch (e){
    hasDescriptors = false
}

// we only need to be able to implement "toString" and "valueOf" in IE < 9
var hasEnumBug = !({valueOf: 0}).propertyIsEnumerable("valueOf"),
    buggy      = ["toString", "valueOf"]

var verbs = /^constructor|inherits|mixin$/
// reset function to reset objects and arrays in the prototype
var reset = function(object){
    for (var key in object){
        var value = object[key];
        switch (type(value)){
            case 'object': 
                object[key] = reset( create(value) ); 
                break;
            case 'array': 
                object[key] = clone(value);
                break;
        }
    }
    return object;
};

var implement = function(proto){
    var prototype = this.prototype;

    for (var key in proto){
        if (key.match(verbs)){
            continue
        }

        if( mutators.hasOwnProperty( key ) ){
            var mutator = mutators[ key ]
            var value = proto[ key ];

            value = mutator.call( this, value );
            
            if( !value ){
               continue;
            }

            switch( kindOf( value ) ){
                case 'function':
                    proto[ key ] = value;
                    break
                case 'object':
                    merge( proto, object );
                    break;
                default:
                    proto[key] = clone( value );
            }
        }

        if (hasDescriptors){
            var descriptor = Object.getOwnPropertyDescriptor(proto, key);
            if (descriptor){
                Object.defineProperty(prototype, key, descriptor);
                continue;
            }
        }
        prototype[key] = proto[key];
    }

    if (hasEnumBug) for (var i = 0; (key = buggy[i]); i++){
        var value = proto[key];
        if (value !== Object.prototype[key]){
            prototype[key] = value;
        }
    }

    return this
}
/**
 * Object class mixing which provides a standard way of defining configuration options on a class instance
 * @constructor
 * @alias module:dispatch-twilio/class
 * @param {Object} prototype an Object representing the prototype of the Class
 */
var prime = function(proto){

    if (kindOf(proto) === "Function") proto = {constructor: proto}

    var superprime = proto.inherits

    // if our nice proto object has no own constructor property
    // then we proceed using a ghosting constructor that all it does is
    // call the parent's constructor if it has a superprime, else an empty constructor
    // proto.constructor becomes the effective constructor
    var constructor = (hasOwn(proto, "constructor")) ? proto.constructor : (superprime) ? function(){
        return superprime.apply(this, arguments)
    } : function(){}

    if (superprime){

        mixIn(constructor, superprime)

        var superproto = superprime.prototype
        // inherit from superprime
        var cproto = constructor.prototype = create(superproto)

        // setting constructor.parent to superprime.prototype
        // because it's the shortest possible absolute reference
        constructor.parent = superproto
        cproto.constructor = constructor
        cproto.$class = constructor
        isObject(proto.options) && isObject(superproto.options) && (proto.options = merge(clone(superproto.options), proto.options));
    }

    if (!constructor.implement) constructor.implement = implement

    var mixins = proto.mixin
    if (mixins){
        if (kindOf(mixins) !== "Array") mixins = [mixins]
        for (var i = 0; i < mixins.length; i++) constructor.implement(create(mixins[i].prototype))
    }

    // implement proto and return constructor
    return constructor.implement(proto)
}


var Class = prime({
    constructor: function(){
        reset(this)
    }
});

/**
 * Registers a Custom Class mutator
 * @static
 * @function defineMutator
 * @memberof module:dispatch-twilio/class
 * @param {String} name The name of the mutator
 * @param {Function} fn The function to use as the class mutator
 **/
prime.defineMutator = function(name ,fn ){
    mutators[ name ] = fn;
};

module.exports = prime;
