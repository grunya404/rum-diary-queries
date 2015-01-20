/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * A Writable stream-like interface used to
 * perform streaming calculations on hit data.
 * Unlike a real Writable stream, no data is buffered
 * and back-pressure is not handled. If back-pressure
 * is a concern, use a real Writable stream instead.
 *
 * @class ReduceStream
 */
function ReduceStream(options) {
  if (! options) {
    options = {};
  }

  // allow arbitrary objects to be written to the stream.
  options.objectMode = true;

  if (this.type === Object) {
    this._data = {};
  } else if (this.type === Array) {
    this._data = [];
  } else if (this.type === Number) {
    this._data = 0;
  } else if (this.type === null && ! this.hasOwnProperty('_data')) {
    throw new Error('this._data must be set if this.type is null');
  } else if (this.type !== null) {
    throw new Error('this.type must be set if this._data is undefined');
  }

  this._options = options;
}

ReduceStream.prototype.write = function (chunk, encoding, callback) {
  callback = callback || function () { /* noOp */ };

  this._write(chunk, encoding, callback);
};

ReduceStream.prototype._write = function (/*chunk, encoding, callback*/) {
  throw new Error('_write must be overridden');
};

/**
 * Call this method when no more data will be written to the stream.
 * Allows references to be freed.
 */
ReduceStream.prototype.end = function(/*chunk, encoding, callback*/) {
  this._data = this._options = null;
};

ReduceStream.prototype.result = function () {
  return this._data;
};

ReduceStream.prototype.getOptions = function () {
  return this._options;
};


module.exports = ReduceStream;
