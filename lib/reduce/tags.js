/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count tags

const util = require('util');

const ReduceStream = require('../reduce-stream');

function TagsStream(options) {
  ReduceStream.call(this, options);
}
util.inherits(TagsStream, ReduceStream);

TagsStream.prototype.name = 'tags';
TagsStream.prototype.type = Object;

TagsStream.prototype._write = function(chunk, encoding, callback) {
  var tags = this._data;
  if (! chunk.tags) {
    return;
  }

  chunk.tags.forEach(function (tag) {
    tag = tag.trim();
    if (! tag.length) {
      return;
    }
    if (! (tag in tags)) {
      tags[tag] = 0;
    }

    tags[tag]++;
  });

  callback(null);
};

module.exports = TagsStream;
