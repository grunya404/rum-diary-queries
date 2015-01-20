/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;

const Stream = require('../../../lib/reduce/site-hostname');


/*global afterEach, describe, it */

describe('reduce/site-hostname', function () {
  var stream;

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('no sorting', function () {
    it('returns hostnames in the order of insertion', function () {
      stream = new Stream();
      stream.write({
        hostname: 'second.com'
      });

      stream.write({
        hostname: 'third.com'
      });

      stream.write({
        hostname: 'second.com'
      });

      stream.write({
        hostname: null
      });

      stream.write({
        hostname: 'first.com'
      });

      var result = stream.result();

      assert.equal(result.length, 3);
      assert.equal(result[0], 'second.com');
      assert.equal(result[1], 'third.com');
      assert.equal(result[2], 'first.com');
    });
  });

  describe('sort in asc order', function () {
    it('returns hostnames in the ascending order', function () {
      stream = new Stream({
        sort: 'asc'
      });

      stream.write({
        hostname: 'third.com'
      });

      stream.write({
        hostname: 'second.com'
      });

      stream.write({
        hostname: 'first.com'
      });

      var result = stream.result();

      assert.equal(result[0], 'first.com');
      assert.equal(result[1], 'second.com');
      assert.equal(result[2], 'third.com');
    });
  });

  describe('sort in desc order', function () {
    it('returns hostnames in the descending order', function () {
      stream = new Stream({
        sort: 'desc'
      });

      stream.write({
        hostname: 'second.com'
      });

      stream.write({
        hostname: 'third.com'
      });

      stream.write({
        hostname: 'first.com'
      });

      var result = stream.result();

      assert.equal(result[0], 'third.com');
      assert.equal(result[1], 'second.com');
      assert.equal(result[2], 'first.com');
    });
  });

  describe('sort with a function', function () {
    it('returns hostnames in the order specified by the function', function () {
      stream = new Stream({
        sort: function(a, b) {
          // sort by length first, alphabetical order next. No two hostnames
          // ever be the same, so the only options are +1 and -1.
          if (a.length === b.length) {
            return a > b ? 1 : -1;
          }
          return a.length - b.length;
        }
      });

      stream.write({
        hostname: 'second.com'
      });

      stream.write({
        hostname: 'third.com'
      });

      stream.write({
        hostname: 'first.com'
      });

      var result = stream.result();

      assert.equal(result[0], 'first.com');
      assert.equal(result[1], 'third.com');
      assert.equal(result[2], 'second.com');
    });
  });
});

