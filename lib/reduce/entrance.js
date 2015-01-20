/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Entrance pages. An entrance page is the first page a user
 * visits on the site. Entrance is the inverse of an
 * "internal-transfer" (see internal-transfer.js)
 *
 * A pageView is counted as an entrance if it lacks a referrer
 * or its referrer is on a different host.
 */


const util = require('util');
const EasierObject = require('easierobject').easierObject;
const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

function Stream(options) {
  ReduceStream.call(this, options);
}

Stream.prototype.name = 'entrance';
Stream.prototype.type = Object;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (! (chunk.referrer_hostname && chunk.hostname)) return;

  // same host? Kick out of here, its an internal transfer
  if (chunk.referrer_hostname === chunk.hostname) return;

  var destPath = chunk.path;

  if (! (destPath in this._data)) {
    this._data[destPath] = 0;
  }
  this._data[destPath]++;

  callback(null);
};

module.exports = Stream;
