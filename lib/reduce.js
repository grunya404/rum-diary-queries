/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const path = require('path');
const Promises = require('bluebird');
const globRequire = require('glob-require');
const logger = require('./logger');

const WATCH_FOR_MEMORY_LEAKS = false;

/**
 * Generic map-reduce for pageView data. Assumed that all pageViews are for
 * the same hostname.
 *
 * Flow:
 * 1) Create an instance of StreamReaduce with the required reduce functions
 *    declared in 'which'.
 * 2) When a pageView becomes available, write it to the stream with `write`.
 * 3) The data will first go through filters declared in `filter`.
 * 4) The data will then go through each `reduce` stream.
 * 5) Results are fetched using `result`
 * 6) Call `end` to free the stream's references.
 */

if (WATCH_FOR_MEMORY_LEAKS) {
  const memwatch = require('memwatch');
  memwatch.on('leak', function (info) {
    logger.error('memory leak: %s', JSON.stringify(info, null, 2));
  });
  memwatch.on('stats', function (info) {
    logger.warn('memory stats: %s', JSON.stringify(info, null, 2));
  });
}

const STREAM_PATH = path.join(__dirname, 'reduce');
var allStreams = [];
loadDirectory(STREAM_PATH, allStreams);

const FILTER_PATH = path.join(__dirname, 'filter');
var allFilters = [];
loadDirectory(FILTER_PATH, allFilters);

function loadDirectory(pathToLoad, modules) {
  globRequire('**/*.js', {
    cwd: pathToLoad
  }, function (err, includes) {
    includes.forEach(function(include) {
      modules.push(include.exports);
    });
  });
}

function shouldAddStream(name, fields) {
  return fields.indexOf(name) > -1;
}

function ReducingStream(options) {
  this._filters = [];
  this._streams = [];

  allFilters.forEach(function(Filter) {
    this._filters.push(new Filter());
  }, this);

  var which = options.which;
  allStreams.forEach(function(Stream) {
    var name = Stream.prototype.name;
    if (shouldAddStream(name, which)) {
      this._streams.push(new Stream(options[name]));
    }
  }, this);
}

ReducingStream.prototype.write = function(chunk/*, encoding, callback*/) {
  var filters = this._filters;
  var filterIndex = 0;
  var self = this;

  nextFilter(null, chunk);

  // this could be made into a series of pipes and let the native
  // stream api take care of everything.
  function nextFilter(err, filteredChunk) {
    if (err) {
      return logger.error('Error filtering: %s', String(err));
    }

    if (! filteredChunk) {
      return logger.debug('Item has been filtered');
    }

    var filter = filters[filterIndex];
    ++filterIndex;

    if (! filter) {
      return sendToStreams(filteredChunk);
    }

    filter.write(filteredChunk, null, nextFilter);
  }

  function sendToStreams(filteredChunk) {
    self._streams.forEach(function(stream) {
      stream.write(filteredChunk);
    });
  }
};

ReducingStream.prototype.end = function(chunk/*, encoding, callback*/) {
  this._streams.forEach(function(stream) {
    stream.end(chunk);
  });
};

ReducingStream.prototype.result = function() {
  var data = {};

  this._streams.forEach(function(stream) {
    data[stream.name] = stream.result();
  });

  return data;
};

module.exports = ReducingStream;
