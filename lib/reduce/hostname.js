/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count visitors by hostname

const util = require('util');
const ReduceStream = require('../reduce-stream');

util.inherits(HostnameStream, ReduceStream);

function HostnameStream(options) {
  ReduceStream.call(this, options);
}

HostnameStream.prototype.name = 'hostnames';
HostnameStream.prototype.type = Object;

HostnameStream.prototype._write = function(chunk, encoding, callback) {
  if (chunk.hostname) {
    if ( ! (chunk.hostname in this._data)) {
      this._data[chunk.hostname] = 0;
    }

    this._data[chunk.hostname]++;
  }

  callback(null);
};

module.exports = HostnameStream;
