/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count visits by os

const util = require('util');

const ReduceStream = require('../reduce-stream');

util.inherits(OSStream, ReduceStream);

function OSStream(options) {
  ReduceStream.call(this, options);
}

OSStream.prototype.name = 'os';
OSStream.prototype.type = Object;

OSStream.prototype._write = function(chunk, encoding, callback) {
  var family;
  if (chunk.os_parsed && chunk.os_parsed.family) {
    family = chunk.os_parsed.family;
    // only add the major # if it is not 0. The default major # is 0
    if (chunk.os_parsed.major) {
      family += (' ' + chunk.os_parsed.major);
    }
  }
  else if (chunk.os) {
    family = chunk.os;
  }

  if (! (family in this._data)) {
    this._data[family] = 0;
  }

  this._data[family]++;

  callback(null);
};

module.exports = OSStream;
