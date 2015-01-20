/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');
const url = require('url');
const navigationTimingData = require('../data/navigation-timing.json');

const ReducingStream = require('../../lib/reduce');

const testExtras = require('../lib/test-extras');
const cPass = testExtras.cPass;
const fail = testExtras.fail;

/*global describe, it */

describe('reduce', function () {
  it('ReducingStream to find tags', function () {
    var stream = new ReducingStream({
      which: 'tags',
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    });

    navigationTimingData.forEach(stream.write.bind(stream));

    var data = stream.result();
    assert.equal(data.tags.nginx, 2);
    assert.equal(data.tags.node, 2);
    assert.equal(data.tags['spdy3.1'], 1);
    assert.equal(data.tags['spdy2.0'], 3);
    assert.isUndefined(data.tags['']);
  });
});

