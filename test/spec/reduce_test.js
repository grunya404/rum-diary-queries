/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const mocha = require('mocha');
const assert = require('chai').assert;
const moment = require('moment');
const url = require('url');
const navigationTimingData = require('../data/navigation-timing.json');

const reduce = require('../../lib/reduce');

const testExtras = require('../lib/test-extras');
const cPass = testExtras.cPass;
const fail = testExtras.fail;

/*global describe, it */

describe('reduce', function () {
  it('findNavigationTimingStats', function (done) {
    reduce.findNavigationTimingStats(navigationTimingData,
      ['range', 'median', 'amean', 'stddev']).then(function(stats) {
        var medianInfo = stats.median;
        assert.isNumber(medianInfo.requestStart);
        assert.isNumber(medianInfo.responseStart);
        assert.isNumber(medianInfo.responseEnd);
        /*assert.isNumber(medianInfo.requestResponseDuration);*/

        assert.isNumber(medianInfo.domLoading);
        assert.isNumber(medianInfo.domInteractive);
        assert.isNumber(medianInfo.domContentLoadedEventStart);
        assert.isNumber(medianInfo.domContentLoadedEventEnd);
        /*assert.isNumber(medianInfo.domContentLoadedEventDuration);*/
        assert.isNumber(medianInfo.domComplete);
        /*assert.isNumber(medianInfo.processingDuration);*/

        assert.isNumber(medianInfo.loadEventStart);
        assert.isNumber(medianInfo.loadEventEnd);
        /*assert.isNumber(medianInfo.loadEventDuration);*/

        var rangeInfo = stats.range;
        assert.isArray(rangeInfo.requestStart);
        assert.isArray(rangeInfo.responseStart);
        assert.isArray(rangeInfo.responseEnd);
        /*assert.isArray(rangeInfo.requestResponseDuration);*/

        assert.isArray(rangeInfo.domLoading);
        assert.isArray(rangeInfo.domInteractive);
        assert.isArray(rangeInfo.domContentLoadedEventStart);
        assert.isArray(rangeInfo.domContentLoadedEventEnd);
        /*assert.isArray(rangeInfo.domContentLoadedEventDuration);*/
        assert.isArray(rangeInfo.domComplete);
        /*assert.isArray(rangeInfo.processingDuration);*/

        assert.isArray(rangeInfo.loadEventStart);
        assert.isArray(rangeInfo.loadEventEnd);
        /*assert.isArray(rangeInfo.loadEventDuration);*/
        done();
      }, fail);
  });

  it('findHostnames', function (done) {
    reduce.findHostnames(navigationTimingData)
      .then(function(data) {
        assert.equal(data.localhost, 9);
        done();
      }, fail);
  });

  it('mapReduce', function () {
    var copy = [];

    // give us a respectable amount of data
    while(copy.length < 100000) {
      copy = copy.concat(navigationTimingData);
    }

    copy.forEach(function (item, index) {
      // test to make sure items that were saved with
      // only referrer are handled correctly.
      if (index > 1000) {
        item.referrer_hostname = url.parse(item.referrer).hostname;
      }
    });

    return reduce.mapReduce(copy, [
      'hostnames',
      'hits_per_page',
      'referrers',
      'navigation',
      'internal-transfer-from'
    ], {
      hits_per_page: {
        start: moment(new Date()).subtract('days', 30),
        end: moment()
      },
      navigation: {
        calculate: ['median']
      }
    }).then(function (data) {
      /*console.log('processing time full: %s ms', data.processing_time);*/
    });
  });

  it('mapReduce with navigation quartiles', function () {
    return reduce.mapReduce(navigationTimingData, [
      'navigation'
    ], {
      start: moment(new Date()).subtract('days', 30),
      end: moment(),
      navigation: {
        calculate: ['quartiles']
      }
    }).then(function (data) {
      /*console.log('processing time quartiles: %s ms', data.processing_time);*/
      assert.ok(data.navigation['25']);
      assert.ok(data.navigation['50']);
      assert.ok(data.navigation['75']);
    });
  });

  it('mapReduce to calculate unique visitors', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'unique'
    ]).then(function (data) {
      assert.equal(data.unique, 8);

      done();
    }, fail);
  });

  it('mapReduce to calculate returning visitors', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'returning'
    ]).then(function (data) {
      assert.equal(data.returning, 1);

      done();
    }, fail);
  });

  it('mapReduce to calculate browsers', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'browsers'
    ]).then(function (data) {
      assert.equal(data.browsers.Firefox, 7);
      assert.equal(data.browsers['Mobile Safari'], 1);
      assert.equal(data.browsers['Chrome Mobile'], 1);
      done();
    }, fail);
  });

  it('mapReduce to calculate operating systems', function (done) {
    reduce.mapReduce(navigationTimingData, [
      'os'
    ]).then(function (data) {
      // tests for both parsed and unparsed OS'
      assert.equal(data.os['Mac OS X 10'], 1);
      assert.equal(data.os['Windows 7'], 6);
      assert.equal(data.os['iOS 7'], 1);
      assert.equal(data.os['Android 4.4'], 1);
      done();
    }, fail);
  });

  it('mapReduce to calculate operating systems based on form factor (mobile vs desktop)',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'os:form'
    ]).then(function (data) {
      assert.equal(data['os:form'].desktop['Mac OS X 10'], 1);
      assert.equal(data['os:form'].desktop['Windows 7'], 6);
      assert.equal(data['os:form'].mobile['iOS 7'], 1);
      assert.equal(data['os:form'].mobile['Android 4.4'], 1);
      done();
    }, fail);
  });

  it('mapReduce to find tags',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'tags'
    ]).then(function (data) {
      assert.equal(data.tags.nginx, 2);
      assert.equal(data.tags.node, 2);
      assert.equal(data.tags['spdy3.1'], 1);
      assert.equal(data.tags['spdy2.0'], 3);
      assert.isUndefined(data.tags['']);
      done();
    }, fail);
  });

  it('mapReduce to find read-time',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'read-time'
    ], {
      'read-time': {
        calculate: 'amean'
      }
    }).then(function (data) {
      assert.equal(data['read-time'], 204);
      done();
    }, fail);
  });

  it('mapReduce to find read-time',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'read-time'
    ]).then(function (data) {
      assert.equal(data['read-time'], 146);
      done();
    }, fail);
  });

  it('mapReduce to find referrers',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'referrers'
    ]).then(function (results) {
      assert.isUndefined(results.referrers.by_hostname['localhost']);
      assert.equal(results.referrers.by_hostname['shanetomlinson.com'], 1);
      done();
    }, fail);
  });

  it('mapReduce to find from where users come and where they go - internally',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'internal-transfer-from'
    ]).then(function (data) {
      assert.equal(data['internal-transfer-from']['by_source']['/site']['/site/localhost'], 7);
      // don't count users who reload
      assert.isUndefined(data['internal-transfer-from']['by_source']['/site/localhost']);

      assert.equal(data['internal-transfer-from']['by_dest']['/site/localhost']['/site'], 7);

      // don't count users who reload
      assert.isUndefined(data['internal-transfer-from']['by_dest']['/site/localhost']['/site/localhost']);
      done();
    }, fail);
  });

  it('mapReduce to find entrance pages',
      function (done) {
    reduce.mapReduce(navigationTimingData, [
      'entrance'
    ]).then(function (result) {
      assert.equal(result.entrance['/site/localhost'], 1);
      assert.equal(Object.keys(result.entrance).length, 1);
      done();
    }, fail);
  });

  it('streamReduce to find tags', function () {
    var stream = new reduce.StreamReduce({
      which: 'tags',
      start: moment(new Date()).subtract('days', 30),
      end: moment()
    });

    navigationTimingData.forEach(stream.write.bind(stream));

    var data = stream.result();
    assert.equal(data.tags.nginx, 2);
    assert.equal(data.tags.node, 2);
    assert.equal(data.tags['spdy3.1'], 1);
    assert.equal(data.tags['spdy2.0'], 3);
    assert.isUndefined(data.tags['']);
  });
});

