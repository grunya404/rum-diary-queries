/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const navigationTimingData = require('../../data/navigation-timing.json');

const Filter = require('../../../lib/filter/referrer');

// cPass - curried pass - call done when done.
function cPass(done) {
  return function () {
    done();
  };
}

// fail - straight up failure.
function fail(err) {
  assert.fail(String(err));
}

/*global describe, it */

describe('reduce/entrance', function () {
  var filter;

  beforeEach(function () {
    filter = new Filter();
  });

  afterEach(function () {
    filter.end();
    filter = null;
  });

  describe('write', function () {
    it('converts referrer to referrer_hostname and referrer_path', function (done) {
      filter.write({
        referrer: 'https://localhost:8000/site/localhost'
      }, 'utf8', function(err, chunk) {
        assert.equal(chunk.referrer_hostname, 'localhost');
        assert.equal(chunk.referrer_path, '/site/localhost');
        done();
      });
    });
  });
});

