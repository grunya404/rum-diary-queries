/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count hits per day

const util = require('util');
const moment = require('moment');
const ReduceStream = require('../reduce-stream');

const MS_PER_DAY = 1000 * 60 * 60 * 24;

util.inherits(HitsPerDayStream, ReduceStream);

function HitsPerDayStream(options) {
  if (! options) options = {};

  options.start = moment(options.start).startOf('day').toDate().getTime();
  options.end = moment(options.end).endOf('day').toDate().getTime();

  ReduceStream.call(this, options);
}

HitsPerDayStream.prototype.name = 'hits_per_day';
HitsPerDayStream.prototype.type = Object;

HitsPerDayStream.prototype._write = function(chunk, encoding, callback) {
  var options = this.getOptions();
  var start = options.start;
  var end = options.end;
  var capturePath = options.path;
  var date = new Date(chunk.createdAt || chunk.updatedAt).getTime();

  if (! capturePath || capturePath === chunk.path) {
    ensurePathInfo(this._data, chunk.path, start, end);
    incrementDailyPathHit(this._data, chunk.path, start, date);
  }

  if (! capturePath || capturePath === '__all') {
    ensurePathInfo(this._data, '__all', start, end);
    incrementDailyPathHit(this._data, '__all', start, date);
  }

  callback(null);
};

function ensurePathInfo(returnedData, path, startDate, endDate) {
  if ( ! returnedData.hasOwnProperty(path)) {
    var numDays = diffDays(startDate, endDate);
    returnedData[path] = new Array(numDays);
    // <= to include both the start and end date
    for (var i = 0; i <= numDays; ++i) {
      var date = new Date();
      date.setTime(startDate + (i * MS_PER_DAY));
      returnedData[path][i] = {
        hits: 0,
        date: moment(date).format('YYYY-MM-DD')
      };
    }
  }

  return returnedData;
}

function diffDays(startDate, date) {
  // Math.floor is really slow, so do
  // Math.floor using bit operations.
  return ((date - startDate) / MS_PER_DAY) << 0;
}

function getPathInfoForDate(pathInfo, path, startDate, date) {
  var index = diffDays(startDate, date);
  return pathInfo[path][index];
}

function incrementDailyPathHit(returnedData, path, startDate, date) {
  var pathInfoOnDate = getPathInfoForDate(returnedData, path, startDate, date);
  if ( ! pathInfoOnDate) throw new Error('invalid date range');
  pathInfoOnDate.hits++;
}


module.exports = HitsPerDayStream;
