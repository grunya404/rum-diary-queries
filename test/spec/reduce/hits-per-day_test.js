/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const navigationTimingData = require('../../data/navigation-timing.json');

const Stream = require('../../../lib/reduce/hits-per-day');

/*global describe, it, beforeEach, afterEach */

describe('reduce/hits-per-day', function () {
  var stream;

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('set to record all paths', function () {
    beforeEach(function () {
      stream = new Stream({
        start: new Date('2013-12-29T00:00:00.000Z'),
        end: new Date('2013-12-30T00:16:32.000Z')
      });
      navigationTimingData.forEach(function(chunk) {
        stream.write(chunk);
      });
    });

    describe('result', function () {
      it('returns __all', function () {
        var result = stream.result();

        assert.equal(result.__all[0].hits, 8);
        assert.equal(result.__all[1].hits, 1);
        assert.equal(result['/site/localhost'][0].hits, 8);
        assert.equal(result['/site/localhost'][1].hits, 1);
      });
    });
  });

  describe('set to record only the aggregate', function () {
    beforeEach(function () {
      stream = new Stream({
        start: new Date('2013-12-29T00:00:00.000Z'),
        end: new Date('2013-12-30T00:16:32.000Z'),
        path: '__all'
      });
      navigationTimingData.forEach(function(chunk) {
        stream.write(chunk);
      });
    });

    describe('result', function () {
      it('returns __all', function () {
        var result = stream.result();

        assert.equal(result.__all[0].hits, 8);
        assert.equal(result.__all[1].hits, 1);
        assert.isUndefined(result['/site/localhost']);
      });
    });
  });

  describe('set to record only a specific path', function () {
    beforeEach(function () {
      stream = new Stream({
        start: new Date('2013-12-29T00:00:00.000Z'),
        end: new Date('2013-12-30T00:17:32.000Z'),
        path: '/site/localhost'
      });
      navigationTimingData.forEach(function(chunk) {
        stream.write(chunk);
      });
    });

    describe('result', function () {
      it('returns the page', function () {
        var result = stream.result();

        assert.equal(result['/site/localhost'][0].hits, 8);
        assert.equal(result['/site/localhost'][1].hits, 1);
        assert.isUndefined(result.__all);
      });
    });
  });
});

