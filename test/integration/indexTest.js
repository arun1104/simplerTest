'use strict';
const mocha = require('mocha');
const assert = require('assert');

const reviewManagement = require('../../index');

let describe;
let it;
if (mocha.describe) {
  describe = mocha.describe;
  it = mocha.it;
} else {
  describe = global.describe;
  it = global.it;
}

describe('get reviews', async() => {
  it('should get reviews', async() => {
    try {
      const response = await reviewManagement.getBestReview(process.env.YELP_FUSION_CLIENT_ID);
      console.log(response);
      assert.deepStrictEqual(response.name, 'Parrelli Optical');
      assert.deepStrictEqual(response.city, 'Cambridge');
      assert.deepStrictEqual(response.street, 'Porter Square Galleria');
      assert.deepStrictEqual(response.userName, 'Audi W.');
      // eslint-disable-next-line max-len
      assert.deepStrictEqual(response.excerpt, 'The best optical all staff very nice and doctor Margot very take good care patient.. you will. Fell comfortable...');
    } catch (err) {
      console.log(err);
    }
  });
});
