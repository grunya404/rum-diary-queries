/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Count internal moves across pages, using the referrer as the source
 * and current page as the destination. `result()` returns a tree
 * with two first level items: `by_source` and `by_dest`.
 *
 * `by_source` contains "exit" data - users who move to other internal pages.
 * `by_dest` contains "entrance" data - users who have come from other internal
 * pages.
 *
 * For `by_source`, the first level is where the user starts. The next
 * level is where the user goes.
 * For `by_dest`, the first level is where the user lands. The next level
 * is where the user comes from.
 */


const util = require('util');
const EasierObject = require('easierobject').easierObject;
const ReduceStream = require('../reduce-stream');

function Stream(options) {
  this._data = new EasierObject({
    by_source: {},
    by_dest: {}
  });
  ReduceStream.call(this, options);
}

util.inherits(Stream, ReduceStream);

Stream.prototype.name = 'internal-transfer-from';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  if (! (chunk.hostname && chunk.path && chunk.referrer_hostname)) {
    return;
  }

  // not the same host? no bueno.
  if (chunk.referrer_hostname !== chunk.hostname) {
    return;
  }

  var sourcePath = chunk.referrer_path;
  var destPath = chunk.path;

  // reload - what's the fun in counting that?
  if (sourcePath === destPath) {
    return;
  }

  var referrers = this._data;

  // used when looking to see where users have come from.
  var byDestValue = referrers.getItem('by_dest', destPath, sourcePath) || 0;
  referrers.setItem('by_dest', destPath, sourcePath, byDestValue + 1);

  // used to see where users are going.
  var bySourceValue = referrers.getItem('by_source', sourcePath, destPath) || 0;
  referrers.setItem('by_source', sourcePath, destPath, bySourceValue + 1);

  callback(null);
};

Stream.prototype.result = function () {
  return this._data.raw();
};

module.exports = Stream;
