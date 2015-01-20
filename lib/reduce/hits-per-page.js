/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count hits per page

const util = require('util');
const ReduceStream = require('../reduce-stream');

util.inherits(Stream, ReduceStream);

function Stream(options) {
  this._data = {
    __all: 0
  };

  this.sort = options.sort;
  this.limit = options.limit;

  ReduceStream.call(this, options);
}

Stream.prototype.name = 'hits_per_page';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  this._data.__all++;

  var path = chunk.path;
  if ( ! path) return;

  if ( ! (path in this._data)) this._data[path] = 0;

  this._data[path]++;

  callback(null);
};

Stream.prototype.result = function() {
  var data = this._data;
  if (! this.sort) return limit(data, this.limit);

  var compare = this.sort === 'asc' ? compareAsc : compareDesc;

  var sorted = Object.keys(data).map(function(key) {
    return {
      page: key,
      hits: data[key]
    };
  }).sort(compare);

  return limit(sorted, this.limit);
};

function limit(data, limitTo) {
  if (! limitTo) return data;
  return data.slice(0, limitTo);
}

function compareDesc(a, b) {
  return b.hits - a.hits;
}

function compareAsc(a, b) {
  return a.hits - b.hits;
}

module.exports = Stream;

