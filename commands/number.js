var cli = require('seeli')
  , Parser = require('../lib/parser')
  , Region = require('../lib/region')
  , Spinner       = require('cli-spinner').Spinner
  , spinner


spinner = new Spinner();
spinner.setSpinnerString( Spinner.spinners[9]);

module.exports = new cli.Command({
	description:'Locate and purchase phone numbers from twilio'
	,usage:[
		cli.bold('Usage: ') + "dispatcher number 4148987474",
		cli.bold('Usage: ') + "dispatcher number +14148987474",
		cli.bold('Usage: ') + "dispatcher number 212.548.2323",
		cli.bold('Usage: ') + "dispatcher number 212.548.2323 --purchase",
		cli.bold('Usage: ') + "dispatcher number 212.548.2323 --twilio:sid=<sid> --twilio:token=<token> --purchase",
	]
	,flags:{
		purchase:{
			type:Boolean
			,default:false
		}
	}
	,run: function( number, data, done ){
		spinner.start()
		var values = new Parser()
			.parse( data.number )
			.then( function( parsed ){
				data.area = parsed.area
				return new Region( data.area ).number()
			})
			.then( function( match ){
				if( data.purchase ){
					return new Region( data.area )
								.purchase( match.phone_number )
				}

				done(null, "located number " + match.phone_number )
			})
			.then(function( purchased ){
				console.log( purchased )
				done(null, "new number: " + purchased.phone_number)
			})
			.catch( function(e ){
				return done( e,'')
			})
			.finally( function(){
				spinner.stop()
			})
	}
})
