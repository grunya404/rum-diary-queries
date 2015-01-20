/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// count visits by form factor

const util = require('util');

const ReduceStream = require('../reduce-stream');

util.inherits(FormFactorStream, ReduceStream);

function FormFactorStream(options) {
  this._data = {
    mobile: {},
    desktop: {}
  };

  ReduceStream.call(this, options);
}

FormFactorStream.prototype.name = 'os:form';
FormFactorStream.prototype.type = null;

FormFactorStream.prototype._write = function(chunk, encoding, callback) {
  var family;
  if (chunk.os_parsed && chunk.os_parsed.family) {
    family = chunk.os_parsed.family;
    // only add the major # if it is not 0. The default major # is 0
    if (chunk.os_parsed.major) {
      family += (' ' + chunk.os_parsed.major);
    }
  }
  else if (chunk.os) {
    family = chunk.os;
  }

  var formFactor = isMobileOS(family) ? 'mobile' : 'desktop';

  if (! (family in this._data[formFactor])) {
    this._data[formFactor][family] = 0;
  }

  this._data[formFactor][family]++;

  callback(null);
};

function isMobileOS(os) {
  return (/(mobile|iOS|android)/ig).test(os);
}


module.exports = FormFactorStream;
