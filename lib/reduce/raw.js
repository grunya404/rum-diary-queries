/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Return the raw data, in an array.

const util = require('util');

const ReduceStream = require('../reduce-stream');

util.inherits(RawStream, ReduceStream);

function RawStream(options) {
  ReduceStream.call(this, options);
}

RawStream.prototype.name = 'raw';
RawStream.prototype.type = Array;

RawStream.prototype._write = function(chunk, encoding, callback) {
  this._data.push(chunk);

  callback(null);
};

module.exports = RawStream;
