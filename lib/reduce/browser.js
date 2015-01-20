/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count visitors by browser

const util = require('util');
const ReduceStream = require('../reduce-stream');

util.inherits(BrowserStream, ReduceStream);

function BrowserStream(options) {
  ReduceStream.call(this, options);
}

BrowserStream.prototype.name = 'browsers';
BrowserStream.prototype.type = Object;

BrowserStream.prototype._write = function(chunk, encoding, callback) {
  if (chunk.browser && chunk.browser.family) {
    var family = chunk.browser.family;

    if (! (family in this._data)) {
      this._data[family] = 0;
    }

    this._data[family]++;
  }

  callback(null);
};

module.exports = BrowserStream;
