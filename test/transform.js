/*global describe, it*/

'use strict';

require('chai').should();
const inflector = require('../lib');

const snakeCaseObj = {
  full_name: 'bob sanders',
  id: 4
};

const camelCaseObJ = {
  fullName: 'bob sanders',
  id: 4
};

describe('transform', function() {
  it('uses the defined transformation', function (done) {
    inflector.transform(camelCaseObJ, 'underscore').should.deep.equal(snakeCaseObj);
    inflector.transform(snakeCaseObj, 'camelizeLower').should.deep.equal(camelCaseObJ);
    done();
  });
});
