/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Count the total hits based on the count of each tag.
 */


const util = require('util');
const ReduceStream = require('../reduce-stream');

function Stream(options) {
  this.tags = options.tags;

  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);

Stream.prototype.name = 'tags-total-hits';
Stream.prototype.type = Number;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (this.tags.indexOf(chunk.name) > -1) {
    this.data += chunk.total_hits;
  }
};

module.exports = Stream;
