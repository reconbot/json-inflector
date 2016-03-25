/*global describe, it, beforeEach*/

'use strict';

let express = require('express');
let inflector = require('../lib');
let bodyParser = require('body-parser');
let app = express();
let request = require('request');

app.use(bodyParser.json());
app.use(inflector());

app.post('/products', (req, res) => {
  let product = req.body;
  console.log('Request:', req.body);
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
