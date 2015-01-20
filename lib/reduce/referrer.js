/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count referrers for an individual host. The assumption is made that
// all incoming chunks are for the same hostname.

const util = require('util');
const ThinkStats = require('think-stats');
const ReduceStream = require('../reduce-stream');

function incrementReferrer(referrerHostname) {
  var referrers = this._data.by_hostname;
  if ( ! referrers[referrerHostname]) {
    referrers[referrerHostname] = 0;
  }

  referrers[referrerHostname]++;
}

function incrementReferrerToPath(referrerHostname, targetPath) {
  var referrers = this._data.by_hostname_to_path;
  if ( ! referrers[referrerHostname]) {
    referrers[referrerHostname] = {};
  }

  if ( ! referrers[referrerHostname][targetPath]) {
    referrers[referrerHostname][targetPath] = 0;
  }

  referrers[referrerHostname][targetPath]++;
}

function sortHostnamesByCount(countByHostname) {
  var sortedByCount = new ThinkStats({
    store_data: true,
    compare: function (a, b) {
      try {
        return b.count - a.count;
      } catch(e) {
      }
    }
  });

  Object.keys(countByHostname).forEach(function (hostname) {
    sortedByCount.push({
      hostname: hostname,
      count: countByHostname[hostname]
    });
  });

  return sortedByCount.sorted();
}


function Stream(options) {
  this._data = {
    by_hostname: {},
    by_hostname_to_path: {}
  };
  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);


Stream.prototype.name = 'referrers';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  if ( ! (chunk.referrer_hostname && chunk.hostname)) {
    return;
  }

  // Do not count internal referrers
  if (chunk.referrer_hostname === chunk.hostname) {
    return;
  }

  var referrerHostname = chunk.referrer_hostname;

  incrementReferrer.call(this, referrerHostname);
  incrementReferrerToPath.call(this, referrerHostname, chunk.path);

  callback(null);
};

Stream.prototype.result = function () {
  this._data.by_count = sortHostnamesByCount(this._data.by_hostname);
  return this._data;
};


module.exports = Stream;
