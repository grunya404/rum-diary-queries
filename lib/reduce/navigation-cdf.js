/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');
const ThinkStats = require('think-stats');

const ReduceStream = require('../reduce-stream');

function Stream(options) {
  options = options || {};

  this._statName = options.statName;
  this._data = new ThinkStats();

  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);


Stream.prototype.name = 'navigation-cdf';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  var value = chunk.navigationTiming[this._statName] || NaN;
  if (isNaN(value) || value === null || value === Infinity) {
    return callback(null);
  }

  this._data.push(value);
  callback(null);
};

Stream.prototype.result = function() {
  return this._data.cdf();
};

module.exports = Stream;

