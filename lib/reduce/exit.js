/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Exit pages. An exit page is the last page a user
 * visits on the site.
 */


const util = require('util');
const EasierObject = require('easierobject').easierObject;
const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

function Stream(options) {
  ReduceStream.call(this, options);
}

Stream.prototype.name = 'exit';
Stream.prototype.type = Object;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (! chunk.is_exit) return;

  var destPath = chunk.path;

  if (! (destPath in this._data)) {
    this._data[destPath] = 0;
  }
  this._data[destPath]++;

  callback(null);
};

module.exports = Stream;
