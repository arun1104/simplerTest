'use strict';
const mocha = require('mocha');
const assert = require('assert');

const reviewManagement = require('../../index');
const constants = require('../../utils/constants');

let describe;
let it;
if (mocha.describe) {
  describe = mocha.describe;
  it = mocha.it;
} else {
  describe = global.describe;
  it = global.it;
}

describe('formatBusinessInfo Positive suit', async() => {
  it('should get formatted businessInfo', async() => {
    try {
      let fulfilledPromise = {status: constants.PROMISE_FULFILLED, value: {data: {name: 'test', location: {city: 'testcity'}}}};
      const response = reviewManagement.formatBusinessInfo(fulfilledPromise);
      console.log(response);
      assert.deepStrictEqual(response.name, 'test');
      assert.deepStrictEqual(response.city, 'testcity');
    } catch (err) {
      console.log(err);
    }
  });

  it('should get formatted businessInfo', async() => {
    try {
      let fulfilledPromise = {status: constants.PROMISE_FULFILLED, value: {data: {name: 'test', location: ''}}};
      const response = reviewManagement.formatBusinessInfo(fulfilledPromise);
      console.log(response);
      assert.deepStrictEqual(response.name, 'test');
    } catch (err) {
      console.log(err);
    }
  });
});
