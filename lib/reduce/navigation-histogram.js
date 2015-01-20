/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');
const ThinkStats = require('think-stats');

const logger = require('../logger');
const ReduceStream = require('../reduce-stream');
util.inherits(Stream, ReduceStream);

function Stream(options) {
  options = options || {};

  this._statName = options.statName;
  this._data = new ThinkStats();

  ReduceStream.call(this, options);
}

Stream.prototype.name = 'navigation-histogram';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  var value = chunk.navigationTiming[this._statName] || NaN;
  if (isNaN(value) || value === null || value === Infinity) return callback(null);

  this._data.push(value);
  callback(null);
};

Stream.prototype.result = function() {
  // bucket the original data to return a smaller,
  // more meaningful data set.
  var startIndex = this._data.percentileIndex(5);
  var endIndex = this._data.percentileIndex(75);

  // slice's endIndex is exclusive, add one to include the endIndex.
  var hitsInRange = this._data.sorted().slice(startIndex, endIndex + 1);
  var bucketed = new ThinkStats();
  bucketed.push(hitsInRange);

  var buckets = Math.min(bucketed.unique().length, 75) || 1;
  var values = [];

  var d = bucketed.bucket(buckets);
  d.forEach(function(bucket) {
    if (! (bucket && bucket.hasOwnProperty('count'))) {
      logger.debug('invalid bucket: %s', bucket);
    }
    for (var i = 0; i < bucket.count; ++i) {
      values.push(bucket.bucket);
    }
  });

  return values;
};

module.exports = Stream;

