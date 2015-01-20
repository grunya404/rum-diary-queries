/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Use referrer to calculate missing referrer_hostname or referrer_path.
 */

/**
 * TODO - investigate node Transform streams to do this.
 */
const url = require('url');

function Filter() {
  // nothing to do.
}

Filter.prototype.write = function(chunk, encoding, callback) {
  if (chunk.referrer_hostname && chunk.referrer_path) {
    return callback(null, chunk);
  }

  if (! chunk.referrer) {
    return callback(null, chunk);
  }

  try {
    // XXX Better to do is to check referrers when
    // the data comes in.
    var parsed = url.parse(chunk.referrer);
    chunk.referrer_hostname = parsed.hostname;
    chunk.referrer_path = parsed.path || '/';
  } catch(e) {
    // do nothing.
  }

  callback(null, chunk);
};

Filter.prototype.end = function () {
  // nothing to do
};

module.exports = Filter;
