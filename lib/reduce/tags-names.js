/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Find tag names.
 */


const util = require('util');
const ReduceStream = require('../reduce-stream');

function Stream(options) {
  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);

Stream.prototype.name = 'tags-names';
Stream.prototype.type = Array;

Stream.prototype._write = function(chunk, encoding, callback) {
  this._data.push(chunk.name);
};

module.exports = Stream;
