var assert = require('assert')
  , should = require('should')
  , Region = require("../lib/region")
  , Promise = require('bluebird')
  , remove = require('mout/array/remove')

describe('region',function(){
	describe('#state', function(){
		
		it('should resolve the resident state', function(){
			var region = new Region( 414 );

			region
				.state()
				.then(function( state ){
					state.should.be.String;
					state.should.equal('wisconsin')
					region.code = 212
					return region.state()
				})
				.then(function( state ){
					state.should.equal('new york');
					region.code = 606
					return region.state()
				})
				.then(function( state ){
					state.should.equal('kentucky')
				})
		});
	});

	describe('#number',function(){
		it('should locate a number in the same area code', function( done ){
			var region = new Region( 414 )
			region
				.number()
				.then( function( data ){
					var bits = /(\d{3})/.exec( data.friendly_name )
					bits[1].should.equal('414')
					done();
				})
		});

		it('should exhaust all area codes', function( done ){
			var codes, region;
			this.timeout(350000)
			region = new Region( 212 )

			region.on( 'search', function( code ){
				remove( codes, "" + code )
			});

			region
				.codes( true )
				.then(function( areacodes ){
					codes = areacodes;
					codes.length.should.not.equal( 0 )
					return region.number();
				})
				.catch( function( e ){
					e.code.should.equal(1001)
					codes.length.should.equal( 0 )
					done()
				})
		})
	});
	describe('#codes', function(){
		var region;

		before(function( done ){
			region = new Region( 414 );
			done()
		});

		it('should return a promise', function( done ){
			var p = region.codes();
			assert.ok( p instanceof Promise );

			p.then( function(){
				done()
			})	
		});
		
		it('should resolve to an array',function( done ) {
			region
				.codes()
				.then( function( codes ){
					assert( Array.isArray( codes ))
					done();
				});
		});

		it('should resolve all area codes in the same state',function( done ) {
			region
				.codes()
				.map(function(code){
					return parseInt( code )
				})
				.then(function( codes ){
					assert(codes.indexOf( 262 ) >= 0 )
					assert(codes.indexOf( 274 ) >= 0 )
					assert(codes.indexOf( 534 ) >= 0 )
					assert(codes.indexOf( 608 ) >= 0 )
					assert(codes.indexOf( 715 ) >= 0 )
					assert(codes.indexOf( 920 ) >= 0 )
					done()
				})
		});
	})
});
