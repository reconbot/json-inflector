/*global describe, it, beforeEach*/

'use strict';

const should = require('chai').should();
const express = require('express');
const supertest = require('supertest');
const inflector = require('../lib');
const bodyParser = require('body-parser');

const camelRoom = {
  activeUsers: [
    { fullName: 'Bob Sanders', id: 1 },
    { fullName: 'Sally Fields', id: 2 }
  ],
  roomInfo: { totalUsers: 2 },
  id: 4
};

const snakeRoom = {
  active_users: [
    { full_name: 'Bob Sanders', id: 1 },
    { full_name: 'Sally Fields', id: 2 }
  ],
  room_info: { total_users: 2 },
  id: 4
};

const circularObj = {
  data: null
};
circularObj.data = circularObj;

let app;
beforeEach(function () {
  app = express();
  app.use(bodyParser.json());
  app.use(inflector());

  app.post('/', function (req, res) {
    res.status(200).send(JSON.stringify(req.body));
  });

  app.get('/', function (req, res) {
    res.status(200).json(snakeRoom);
  });

  app.get('/circular', function (req, res) {
    res.status(200).json(circularObj);
  });

  /* eslint-disable no-unused-vars */
  app.use(function errorHandler(err, req, res, next) {
    res.status(500);
    res.send({ error: err.message });
  });

});

describe('nested inflection ', function () {
  it('requests are changed to snake case', function (done) {
    supertest(app)
      .post('/')
      .send(camelRoom)
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        JSON.parse(res.text).should.eql(snakeRoom);
        done();
      });
  });

  it('responses are changed to camelCase', function (done) {
    supertest(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        should.not.exist(err);
        res.body.should.eql(camelRoom);
        done();
      });
  });

  it('circular responses throw', function (done) {
    supertest(app)
      .get('/circular')
      .expect(500)
      .end((err, res) => {
        res.body.should.eql({ error: 'Converting circular structure to JSON' });
        done();
      });
  });

});
