/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const navigationTimingData = require('../../data/navigation-timing.json');

const Stream = require('../../../lib/reduce/internal-transfer-to');

const testExtras = require('../../lib/test-extras');
const cPass = testExtras.cPass;
const fail = testExtras.fail;

/*global describe, it */

describe('reduce/internal-transfer-to', function () {
  var stream;

  beforeEach(function () {
    stream = new Stream();
    navigationTimingData.forEach(function(pageView) {
      stream.write(pageView);
    });
  });

  afterEach(function () {
    stream.end();
    stream = null;
  });

  describe('result', function () {
    it('returns pages with refer_to on the same hostname whose paths are different', function () {
      var result = stream.result();

      assert.equal(result.by_dest['/site/localhost/performance']['/site/localhost'], 2);
      assert.equal(Object.keys(result.by_dest).length, 1);

      assert.equal(result.by_source['/site/localhost']['/site/localhost/performance'], 2);
      assert.equal(Object.keys(result.by_source).length, 1);
    });
  });
});

