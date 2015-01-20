/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('chai').assert;
const navigationTimingData = require('../../data/navigation-timing.json');

const Stream = require('../../../lib/reduce/referrer');

/*global describe, it, beforeEach, afterEach */

describe('reduce/referrer', function () {
  var stream;

  beforeEach(function () {
    stream = new Stream();
    navigationTimingData.forEach(function(chunk) {
      stream.write(chunk);
    });
  });

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('result', function () {
    it('returns by_hostname', function () {
      var result = stream.result();

      // referrers that are the same as the hostname not counted.
      assert.isUndefined(result.by_hostname.localhost);
      assert.equal(result.by_hostname['shanetomlinson.com'], 1);
    });

    it('returns by_count', function () {
      var result = stream.result();

      assert.equal(result.by_count[0].hostname, 'shanetomlinson.com');
      assert.equal(result.by_count[0].count, 1);
    });

    it('returns by_hostname_to_path', function () {
      var result = stream.result();

      // referrers that are the same as the hostname not counted.
      assert.isUndefined(result.by_hostname_to_path.localhost);

      assert.equal(result.by_hostname_to_path['shanetomlinson.com']['/site/localhost'], 1);
    });
  });
});

