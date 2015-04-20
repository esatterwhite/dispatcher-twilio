https://gist.github.com/kevinstumpf/de5bc16cb2b152e2e5e7


## Installation

Installation is done through `npm`

#### Package install
```shell
npm install --production
```
##### Usage

```js
var dispatcher = require('dispatcher-twilio');

dispatcher
	.purchasePhoneNumberAsync({nearPhoneNumber:'+12124913782'})
	.then(function( data ){
		console.log( 'new number: %s', data.phone_number)
		console.log('number sid: %s', data.sid 	)
		return data.phone_number
	})
	.catch(function(e){
		console.error('something bad happend', e)
	})
```

#### CLI Install

```shell
npm link
dispatcher --help
dispatcher number --help
```


