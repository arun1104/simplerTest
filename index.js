'use strict';
const axios = require('axios');
const constants = require('./utils/constants');
const Logger = require('./utils/logger');
const {v4: uuidv4} = require('uuid');

class ReviewManagement{
  constructor(){
    this.httpClient = axios;
    this.getBusinessClientReviews = this.getBusinessClientReviews.bind(this);
    this.getBusinessInfo = this.getBusinessInfo.bind(this);
    this.getBestReview = this.getBestReview.bind(this);
    this.getTopReview = this.getTopReview.bind(this);
    this.formatResponse = this.formatResponse.bind(this);
    this.formatBusinessInfo = this.formatBusinessInfo.bind(this);
    this.sort = this.sort.bind(this);
  }

  formatBusinessInfo(businessPromiseValue){
    if (businessPromiseValue.status === constants.PROMISE_FULFILLED){
      let result = {};
      result.name = businessPromiseValue.value.data.name || constants.EMPTY;
      result.city = (businessPromiseValue.value.data.location) ? businessPromiseValue.value.data.location.city : constants.EMPTY;
      result.street = (businessPromiseValue.value.data.location) ? businessPromiseValue.value.data.location.address3 : constants.EMPTY;
      return result;
    } else {
      let errObj = {message: constants.YELP_REVIEWS_ERROR, code: constants.YELP_ERROR};
      throw errObj;
    }
  }

  getTopReview(reviewPromiseValue){
    if (reviewPromiseValue.status === constants.PROMISE_FULFILLED){
      let reviews = reviewPromiseValue.value;
      this.sort(reviews.data.reviews, constants.RATING);
      reviews = reviews.data.reviews;
      return reviews[reviews.length - 1];
    } else {
      let errObj = {message: constants.YELP_REVIEWS_ERROR, code: constants.YELP_ERROR};
      throw errObj;
    }
  }

  async getBusinessClientReviews(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_REVIEWS_URL;
    relativeUrl = relativeUrl.replace('{}', businessId);
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}`;
    let headers = {
      headers: {
        Authorization: `${constants.BEARER}${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return axios.get(businessInfoUrl, headers);
  }

  async getBusinessInfo(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_BUSINESS_INFO_URL;
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}/${businessId}`;
    let headers = {
      headers: {
        Authorization: `${constants.BEARER}${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return axios.get(businessInfoUrl, headers);
  }

  async getBestReview(businessId){
    let correlationId = uuidv4();
    const logger = new Logger(correlationId, 'getBestReview-ReviewManagement', 'getBestReview');
    logger.info('Entry');
    try {
      let reviewsPromise = this.getBusinessClientReviews(businessId);
      let businessInfoPromise = this.getBusinessInfo(businessId);
      let promResArray = await Promise.allSettled([businessInfoPromise, reviewsPromise]);
      logger.info('businessInfoPromise responses status', promResArray[0].status);
      logger.info('reviewsPromise responses status', promResArray[1].status);
      logger.info('businessInfoPromise responses value', promResArray[0].value.data);
      logger.info('reviewsPromise responses value', promResArray[1].value.data);
      let topReview = this.getTopReview(promResArray[1]);
      let businessInfo = this.formatBusinessInfo(promResArray[0]);
      let result = this.formatResponse(topReview, businessInfo);
      return result;
    } catch (err){
      logger.error(err);
      return err;
    }

  }

  sort(items, attribute){
    items.sort(function(a, b) { return a[attribute] - b[attribute]; });
  }

  formatResponse(review, businessInfo){
    let result = {};
    result.name = businessInfo.name;
    result.city = businessInfo.city;
    result.street = businessInfo.street;
    result.excerpt = review.text;
    result.userName = review.user.name;
    return result;
  }
}

async function main(){
  const reviewManagement = new ReviewManagement();
  const response = await reviewManagement.getBestReview(process.env.YELP_FUSION_CLIENT_ID);
  console.log(response);
  return response;
}

main();
module.exports = new ReviewManagement();
