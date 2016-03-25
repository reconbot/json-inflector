# `json-inflector`

The JSON Inflector is a node.js package for providing a [Connect](http://www.senchalabs.org/connect/)/[Express](http://expressjs.com/) middleware that can be used modify json requests and responses with with inflection rules.

Credit to the [`cors`](https://github.com/expressjs/cors) library and it's authors for providing the project structure to make an express middleware.

[![NPM](https://nodei.co/npm/json-inflector.png?downloads=true&stars=true)](https://nodei.co/npm/json-inflector/)

[![build status](https://secure.travis-ci.org/reconbot/json-inflector.png)](http://travis-ci.org/reconbot/json-inflector)
* [Installation](#installation)
* [Usage](#usage)
  * [Simple Usage](#simple-usage-enable-all-cors-requests)
  * [Enable for a Single Route](#enable-for-a-single-route)
  * [Configuring JSON Inflector](#configuring-json-inflector)
* [Configuration Options](#configuration-options)
* [License](#license)
* [Author](#author)

## Installation (via [npm](https://npmjs.org/package/cors))

Requires NodeJS 4+ and we test with the latest 2 major and latest 3 minor patches.

```bash
$ npm install --save json-inflector
```

## Usage

### Default Usage (camelCase <=> snake_case)

Snake case on the server, camel case on the client.

```javascript
let express = require('express');
let inflector = require('json-inflector');
let bodyParser = require('body-parser');
let app = express();
let request = require('request');

app.use(bodyParser.json());
app.use(inflector());

app.post('/products', (req, res) => {
  let product = req.body;
  console.log('Request:', product);
  product.product_price = 100;
  res.json(product);
});

app.listen(8080, () => {
  request.post({
    url: 'http://localhost:8080/products',
    json: true,
    body: {productName: 'Race car'}
  }, (err, res) => {
    console.log('Response:', res.body);
    process.exit();
  });
});

// Request: { product_name: 'Race car' }
// Response: { productName: 'Race car', productPrice: 100 }

```

### Enable for a Single Route

```javascript
let express = require('express');
let inflector = require('json-inflector');
let bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json());

app.get('/products/:id', inflector(), function(req, res, next){
  res.json({status_message: 'statusMessage for all products'});
});
```

### Configuring JSON Inflector

```javascript
let express = require('express');
let inflector = require('json-inflector');
let bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.json());

let options = {
  response: 'dasherize'
};

app.get('/products/:id', inflector(options), function(req, res, next){
  res.json({status_message: 'status-message for all products'});
});
```


## Configuration Options

We use [inflection](https://github.com/dreamerslab/node.inflection) to do the key inflecting. You can pass the name of any of it's functions to be used. We've added `camelizeLower` which is the same as `camelize` with lower first letters by default.


* `request`: Configures the request processing.
* `response`: Configures the request processing.

Both methods are optional and take the same kinds of arguments.

  - `String` - The name of a [`inflection`](https://github.com/dreamerslab/node.inflection) function to processes the keys of a request.
  - `Array` - The names of functions to be passed to inflection's [`transform()`](https://github.com/dreamerslab/node.inflection#inflectiontransform-str-arr-) function.

The default configuration is the equivalent of:

```json
{
  request: 'underscore',
  response: 'camelizeLower'
};
```

## License

[MIT License](http://www.opensource.org/licenses/mit-license.php)

## Author

[Francis Gulotta](https://github.com/reconbot) ([wizard@roborooter.com](mailto:wizard@roborooter.com))
