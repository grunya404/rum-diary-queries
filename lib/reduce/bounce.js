/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Pages where users bounce. A bounced page is an entrance page (see
 * entrance.js) that is also an exit page (see exit.js).
 */


const util = require('util');
const ReduceStream = require('../reduce-stream');

function Stream(options) {
  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);


Stream.prototype.name = 'bounce';
Stream.prototype.type = Object;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (! (chunk.referrer_hostname && chunk.hostname)) {
    return;
  }
  if ((! chunk.is_exit) || chunk.hostname === chunk.referrer_hostname) {
    return;
  }


  var destPath = chunk.path;

  if (! (destPath in this._data)) {
    this._data[destPath] = 0;
  }
  this._data[destPath]++;

  callback(null);
};

module.exports = Stream;
