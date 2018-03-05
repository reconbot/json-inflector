/*global describe, it, beforeEach*/

'use strict';

const should = require('chai').should();
const express = require('express');
const supertest = require('supertest');
const inflector = require('../lib');
const bodyParser = require('body-parser');

const snakeCaseObj = {
  full_name: 'bob sanders',
  id: 4,
  ignored: true
};

const otherSnakeCaseObj = {
  full_name: 'bob sanders',
  id: 4,
  ignored: {
    alsoignored: true,
    alsoignoring: "sanders bob"
  }
};

const upperCamelObj = {
  FullName: 'bob sanders',
  Id: 4,
  Ignored: true
};

const capDasherized = {
  'Full-name': 'bob sanders',
  Id: 4,
  Ignored: true
};

const blackList = {
  'FullName': 'bob sanders',
  Id: 4,
  ignored: true
};

const blackListWithProperties = {
  'FullName': 'bob sanders',
  Id: 4,
  ignored: {
    alsoignored: true,
    alsoignoring: "sanders bob"
  }
};

let app;
beforeEach(function () {
  app = express();
  app.use(bodyParser.json());

  app.post('/camelizeRequest', inflector({ request: 'camelize' }), function (req, res) {
    res.status(200).send(JSON.stringify(req.body));
  });

  app.get('/camelizeResponse', inflector({ response: 'camelize' }), function (req, res) {
    res.status(200).send(snakeCaseObj);
  });

  app.get('/arrayOfResponses', inflector({ response: ['capitalize', 'dasherize'] }), function (req, res) {
    res.status(200).send(snakeCaseObj);
  });

  app.get('/blackList', inflector({ response: 'camelize', blackList: ['ignored'] }), function (req, res) {
    res.status(200).send(snakeCaseObj);
  });

  app.get('/blackListWithProperties', inflector({ response: 'camelize', blackList: [{ 'ignored': { 'props': 'noinflect' } }] }), function (req, res) {
    res.status(200).send(otherSnakeCaseObj);
  });

});

describe('configure inflections so', function () {
  it('requests are changed to upperCamelCase', function (done) {
    supertest(app)
      .post('/camelizeRequest')
      .send(snakeCaseObj)
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        JSON.parse(res.text).should.eql(upperCamelObj);
        done();
      });
  });

  it('responses are changed to upperCamelCase', function (done) {
    supertest(app)
      .get('/camelizeResponse')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.eql(upperCamelObj);
        done();
      });
  });

  it('responses are changed to a combination', function (done) {
    supertest(app)
      .get('/arrayOfResponses')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.eql(capDasherized);
        done();
      });
  });

  it('responses are changed to upperCamelCase except ignored property', function (done) {
    supertest(app)
      .get('/blackList')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.eql(blackList);
        done();
      });
  });

  it('responses are changed to upperCamelCase except ignored property and its properties', function (done) {
    supertest(app)
      .get('/blackListWithProperties')
      .expect(200)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.eql(blackListWithProperties);
        done();
      });
  });

});
