/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// calculate read time stats.

const util = require('util');
const Stats = require('think-stats');

const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

/**
 * @constructor
 * @param {object} options
 * @param {string} [options.calculate] - stat to calculate. default: `median`
 */
function Stream(options) {
  options = options || {};
  this.calculate = options.calculate || 'median';

  this._data = new Stats();
  ReduceStream.call(this, options);
}

Stream.prototype.name = 'read-time';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  var duration = chunk.duration;

  if (! isNaN(duration) && duration !== null && duration > 0) {
    this._data.push(duration);
  }

  callback(null);
};

Stream.prototype.result = function () {
  return this._data[this.calculate]() << 0;
};

module.exports = Stream;
