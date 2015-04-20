var assert = require( 'assert' )
  , should = require( 'should' )
  , Parser = require('../lib/parser')


describe('Parser', function( ){

	var parser
	before(function( done ){
		parser = new Parser()
		done();
	})  
	it('should raise an error for invalid numbers', function( done ){
		parser.parse('one')
			.catch(function(e){
				assert.ok( e instanceof Error );
				done();
			})
	})
	describe("#parse", function( ){
		it('should parse E164 like numbers', function( done ){
			parser
				.parse('+12345679898')
				.then(function( data ){
					data.area.should.equal( '234' )
					data.prefix.should.equal('567')
					data.suffix.should.equal('9898')
					done();
				})
		});

		it('should understand common formats', function( done ){
			parser
				.parse('(262) 424 5844')
				.then(function(data){
					data.area.should.equal( '262' )
					data.prefix.should.equal('424')
					data.suffix.should.equal('5844')
				});
			parser
				.parse('(262)-424-5844')
				.then(function(data){
					data.area.should.equal( '262' )
					data.prefix.should.equal('424')
					data.suffix.should.equal('5844')
				});

			parser
				.parse('1.245.234.2234 x413')
				.then( function( data ){
					data.area.should.equal( '245' )
					data.prefix.should.equal('234')
					data.suffix.should.equal('2234')
				})

			done();
		})
	})
})
