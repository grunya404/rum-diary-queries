/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count visits by os

const util = require('util');
const ThinkStats = require('think-stats');
const EasierObject = require('easierobject').easierObject;

const ReduceStream = require('../reduce-stream');

function createStat(options) {
  return new ThinkStats(options);
}

function getNavigationTimingAccumulators(options) {
  // For descriptions, see:
  // https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/NavigationTiming/Overview.html#processing-model

  // prompt for unload
  var stats = {
    navigationStart: createStat(options),

    // redirect - only visible if redirecting from the same domain.
    redirectStart: createStat(options),
    redirectEnd: createStat(options),
    /*redirectDuration: createStat(options),*/

    // App cache
    fetchStart: createStat(options),

    // DNS - will be the same as fetchStart if DNS is already resolved.
    domainLookupStart: createStat(options),
    domainLookupEnd: createStat(options),
    /*domainLookupDuration: createStat(options),*/

    // TCP - will be the same as domainLookupDuration if reusing a connection.
    connectStart: createStat(options),
    secureConnectionStart: createStat(options),
    connectEnd: createStat(options),
    /*connectDuration: createStat(options),*/

    // request & response
    requestStart: createStat(options),
    responseStart: createStat(options),
    responseEnd: createStat(options),
    /*requestResponseDuration: createStat(options),*/

    // unload previous page - only valid previous page was on the same domain.
    unloadEventStart: createStat(options),
    unloadEventEnd: createStat(options),
    /*unloadEventDuration: createStat(options),*/

    // processing
    domLoading: createStat(options),
    domInteractive: createStat(options),
    domContentLoadedEventStart: createStat(options),
    domContentLoadedEventEnd: createStat(options),
    /*domContentLoadedEventDuration: createStat(options),*/
    domComplete: createStat(options),

    // load
    loadEventStart: createStat(options),
    loadEventEnd: createStat(options)/*,
    loadEventDuration: createStat(options),*/
    /*processingDuration: createStat(options)*/
  };

  return stats;
}

function freeNavigationTimingAccumulators(accumulators) {
  for (var key in accumulators) {
    accumulators[key].destroy();
    accumulators[key] = null;
    delete accumulators[key];
  }
}

function toStatsToCalculate(userDefinedStats) {
  return userDefinedStats.reduce(function (prevValue, curr) {
    if (! isNaN(curr)) {
      prevValue.push({
        name: 'percentile',
        args: [ parseInt(curr, 10) ],
        outName: curr
      });
    } else if (curr === 'quartiles') {
      prevValue.push({
        name: 'percentile',
        args: [25],
        outName: '25'
      });
      prevValue.push({
        name: 'percentile',
        args: [50],
        outName: '50'
      });
      prevValue.push({
        name: 'percentile',
        args: [75],
        outName: '75'
      });
    } else {
      prevValue.push({
        name: curr,
        args: [],
        outName: curr
      });
    }
    return prevValue;
  }, []);
}


function calculateNavigationTimingStats(accumulators, statsUserWants) {
  var statsToCalculate = toStatsToCalculate(statsUserWants);
  var returnedStats = new EasierObject();

  for (var key in accumulators) {
    //jshint loopfunc:true
    statsToCalculate.forEach(function (stat) {
      var accumulator = accumulators[key];
      var value = accumulator[stat.name].apply(accumulator, stat.args);
      returnedStats.setItem(stat.outName, key, value);
    });
  }

  return returnedStats.obj;
}



function Stream(options) {
  this._data = getNavigationTimingAccumulators(options);

  ReduceStream.call(this, options);
}
util.inherits(Stream, ReduceStream);

Stream.prototype.name = 'navigation';
Stream.prototype.type = null;

Stream.prototype._write = function(chunk, encoding, callback) {
  var stats = this._data;
  var navTiming = chunk.navigationTiming;

  for (var key in navTiming) {
    if (stats.hasOwnProperty(key)) {
      var value = navTiming[key];
      if (!(isNaN(value) || value === null || value === Infinity)) {
        stats[key].push(navTiming[key]);
      }
    }
  }

  /*
  stats.redirectDuration.push(
            navTiming.redirectEnd - navTiming.redirectStart);

  stats.domainLookupDuration.push(
            navTiming.domainLookupEnd - navTiming.domainLookupStart);

  stats.connectDuration.push(
            navTiming.connectEnd - navTiming.connectStart);

  stats.requestResponseDuration.push(
            navTiming.responseEnd - navTiming.requestStart);

  stats.unloadEventDuration.push(
            navTiming.unloadEventEnd - navTiming.unloadEventStart);

  stats.domContentLoadedEventDuration.push(
            navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);

  stats.loadEventDuration.push(
            navTiming.loadEventEnd - navTiming.loadEventStart);

  stats.processingDuration.push(
            navTiming.loadEventEnd - navTiming.domLoading);
  */

  callback(null);
};

Stream.prototype.result = function () {
  var options = this.getOptions();
  var navTimingStats = calculateNavigationTimingStats(
                            this._data, options.calculate);

  return navTimingStats;
};

Stream.prototype.end = function(chunk, encoding, callback) {
  if (chunk) {
    this.write(chunk);
  }
  // free the accumulator references, they are no longer needed.
  // The accumulators cause the heap to grow to the point of OOM.
  freeNavigationTimingAccumulators(this._data);
  ReduceStream.prototype.end.call(this, chunk, encoding, callback);
};


module.exports = Stream;
