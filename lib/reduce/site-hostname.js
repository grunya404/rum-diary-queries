/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Return site hostnames.
 */


const util = require('util');
const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

function Stream(options) {
  options = options || {};

  if (options.sort) {
    this.sort = options.sort;
  }

  ReduceStream.call(this, options);
}

Stream.prototype.name = 'site:hostname';
Stream.prototype.type = Object;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (chunk.hostname) {
    this._data[chunk.hostname] = true;
  }
};

Stream.prototype.result = function () {
  var hostnames = Object.keys(this._data);

  if (typeof this.sort === 'function') {
    return hostnames.sort(this.sort);
  } else if (this.sort === 'asc') {
    return hostnames.sort();
  } else if (this.sort === 'desc') {
    return hostnames.sort(function(a, b) {
      // hostnames are unique, the only options are 1 and -1.
      return (a > b) ? -1 : 1;
    });
  }

  return hostnames;
};

module.exports = Stream;
