/*global describe, it, beforeEach*/

'use strict';

const should = require('chai').should();
const express = require('express');
const supertest = require('supertest');
const inflector = require('../lib');
const bodyParser = require('body-parser');

const snakeCaseObj = {
  full_name: 'bob sanders',
  id: 4
};

const camelCaseObJ = {
  fullName: 'bob sanders',
  id: 4
};

let app;
beforeEach(function () {
  app = express();
  app.use(bodyParser.json());
  app.use(inflector());

  app.post('/', function (req, res) {
    res.status(200).send(JSON.stringify(req.body));
  });

  app.get('/', function (req, res) {
    res.status(200).json(snakeCaseObj);
  });

  app.get('/oldstyle', function (req, res) {
    res.json(200, snakeCaseObj);
  });

  app.get('/olderstyle', function (req, res) {
    res.json(snakeCaseObj, 200);
  });

  app.get('/inconsiderateStyle', function (req, res) {
    res.send(snakeCaseObj);
  });
});

describe('default inflections to', function () {
  it('requests are changed to snake case', function (done) {
    supertest(app)
      .post('/')
      .send(camelCaseObJ)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        JSON.parse(res.text).should.eql(snakeCaseObj);
        done();
      });
  });

  it('responses are changed to camelCase', function (done) {
    supertest(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.eql(camelCaseObJ);
        done();
      });
  });

  it('works when people use deprecated json(status, obj)', function (done) {
    supertest(app)
      .get('/oldstyle')
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.eql(camelCaseObJ);
        done();
      });
  });

  it('works when people use deprecated json(obj, status)', function (done) {
    supertest(app)
      .get('/olderstyle')
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.eql(camelCaseObJ);
        done();
      });
  });

  it('works when people use send(obj)', function (done) {
    supertest(app)
      .get('/inconsiderateStyle')
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.eql(camelCaseObJ);
        done();
      });
  });
});
