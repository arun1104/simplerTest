'use strict';
const {httpClient} = require('./services/httpService');
const constants = require('./utils/constants');
const Logger = require('./utils/logger');
const {v4: uuidv4} = require('uuid');
require('dotenv').config();
class ReviewManagement{
  constructor(httpClient){
    this.httpClient = httpClient;
    this.getBusinessClientReviews = this.getBusinessReviews.bind(this);
    this.getBusinessInfo = this.getBusinessInfo.bind(this);
    this.getBusinessList = this.getBusinessList.bind(this);
    this.getBestReview = this.getBestReview.bind(this);
    this.formatResponse = this.formatResponse.bind(this);
    this.formatBusinessInfo = this.formatBusinessInfo.bind(this);
  }

  async getUnresolvedPromisesSynchronously(type, businessIds){
    switch (type) {
      case 'businessInfo':
        let resp = await this.getBusinessInfoSynchronously(businessIds);
        return resp;
      case 'review':
        let revResp = await this.getBusinessReviewsSynchronously(businessIds);
        return revResp;
      default:
        break;
    }
  }

  getUnResolved_BusinessInfoPromises(promisesRespArray, businessIds, businessInfoMap){
    let result = [];
    for (let index = 0; index < promisesRespArray.length; index++) {
      const element = promisesRespArray[index];
      if (element.status !== constants.PROMISE_FULFILLED){
        result.push(businessIds[index]);
      } else {
        businessInfoMap.set(businessIds[index], element.value.data);
      }
    }
    return result;
  }

  getUnResolved_BusinessReviewPromises(promisesRespArray, businessIds, businessReviewMap){
    let result = [];
    for (let index = 0; index < promisesRespArray.length; index++) {
      const element = promisesRespArray[index];
      if (element.status !== constants.PROMISE_FULFILLED){
        result.push(businessIds[index]);
      } else {
        businessReviewMap.set(businessIds[index], element.value.data.reviews);
      }
    }
    return result;
  }

  async getBusinessList(queryOptions){
    let relativeUrl = constants.YELP_GET_BUSINESSES_WITH_CATEGORIES_URL;
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}`;
    let headers = {
      params: queryOptions,
      headers: {
        Authorization: `${constants.BEARER}${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return this.httpClient.get(businessInfoUrl, headers);
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

  async getBusinessReviews(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_REVIEWS_URL;
    relativeUrl = relativeUrl.replace('{}', businessId);
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}`;
    let headers = {
      headers: {
        Authorization: `${constants.BEARER}${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return this.httpClient.get(businessInfoUrl, headers);
  }

  async getBusinessInfo(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_BUSINESS_INFO_URL;
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}/${businessId}`;
    let headers = {
      headers: {
        Authorization: `${constants.BEARER}${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return this.httpClient.get(businessInfoUrl, headers);
  }

  async getBusinessReviewsSynchronously(ids){
    let result = [];
    try {
      for (let index = 0; index < ids.length; index++) {
        let resp = await this.getBusinessReviews(ids[index]);
        result.push(resp.data);
      }
    } catch (err){
      console.log(err);
    }
    return result;
  }

  async getBusinessInfoSynchronously(ids){
    let result = [];
    try {
      for (let index = 0; index < ids.length; index++) {
        let resp = await this.getBusinessInfo(ids[index]);
        result.push(resp.data);
      }
    } catch (err){
      console.log(err);
    }
    return result;
  }

  generateBusinessReviewsPromiseArray(ids){
    let result = [];
    ids.forEach(element => {
      result.push(this.getBusinessReviews(element));
    });
    return result;
  }

  generateBusinessInfoPromiseArray(ids){
    let result = [];
    ids.forEach(element => {
      result.push(this.getBusinessInfo(element));
    });
    return result;
  }

  fillBusinessReviewMap(businessReviewMap, pendingResponses){
    pendingResponses.forEach(element => {
      if (!businessReviewMap.has(element.id)){
        businessReviewMap.set(element.id, element);
      }
    });

  }

  getUserReview(reviews){
    for (let index = 0; index < reviews.length; index++) {
      const element = reviews[index];
      if (element.text && element.user){
        return {user: element.user, exerpt: element.text};
      }

    }
  }
  fillBusinessInfoMap(businessInfoMap, businessInfoPromisesRespArray){
    businessInfoPromisesRespArray.forEach(element => {
      if (!businessInfoMap.has(element.id)){
        businessInfoMap.set(element.id, element);
      }
    });
  }

  async getBestReview(categories, location, topCount){
    let correlationId = uuidv4();
    const logger = new Logger(correlationId, 'getBestReview-ReviewManagement', 'getBestReview');
    logger.info('Entry');
    try {
    //   let reviewsPromise = this.getBusinessClientReviews(businessId);
    //   let businessInfoPromise = this.getBusinessInfo(businessId);
      let queryOptions = {
        categories,
        location,
        offset: 0,
        limit: topCount,
        sort_by: constants.SORT_BY_RATING,
      };
      let businessList = await this.getBusinessList(queryOptions);
      let businessReviewMap = new Map();
      let businessInfoMap = new Map();
      let businessIds = businessList.data.businesses.map(e => e.id);

      // Get review
      let businessReviewsPromisesArray = this.generateBusinessReviewsPromiseArray(businessIds);
      let businessReviewsPromisesRespArray = await Promise.allSettled(businessReviewsPromisesArray);
      let unResolvedReviewPromises = this.getUnResolved_BusinessReviewPromises(businessReviewsPromisesRespArray,
        businessIds, businessReviewMap);
      let pendingResponses = await this.getUnresolvedPromisesSynchronously('review', unResolvedReviewPromises);
      this.fillBusinessReviewMap(businessReviewMap, pendingResponses);

      // Get business info
      let businessInfoPromisesArray = this.generateBusinessInfoPromiseArray(businessIds);
      let businessInfoPromisesRespArray = await Promise.allSettled(businessInfoPromisesArray);
      let unResolvedInfoPromises = this.getUnResolved_BusinessInfoPromises(businessInfoPromisesRespArray, businessIds, businessInfoMap);
      let pendingReviewResponses = await this.getUnresolvedPromisesSynchronously('businessInfo', unResolvedInfoPromises);
      this.fillBusinessInfoMap(businessInfoMap, pendingReviewResponses);
      let result = this.formatResponse(businessReviewMap, businessInfoMap, businessIds);
      return result;
    } catch (err){
      logger.error(err);
      return err;
    }

  }

  sort(items, attribute){
    items.sort(function(a, b) { return a[attribute] - b[attribute]; });
  }

  formatResponse(businessReviewMap, businessInfoMap, businessIds){
    let result = [];
    businessIds.forEach(element => {
      let item = {};
      if (businessReviewMap.has(element)){
        let reviews = businessReviewMap.get(element);
        let validReview = this.getUserReview(reviews);
        item.exerpt = validReview.exerpt;
        item.userName = validReview.user.name;
      }
      if (businessInfoMap.has(element)){
        let info = businessInfoMap.get(element);
        item.name = info.name;
        item.city = info.location.city;
        item.address = info.location.address1;
        item.street = info.location.address3;
      }
      result.push(item);
    });
    return result;
  }
}
async function main(){
  const reviewManagement = new ReviewManagement(httpClient);
  const response = await reviewManagement.getBestReview(constants.ICE_CREAM_CATEGORY, constants.REDWOOD_CITY, 10);
  console.log(response);
  return response;
}

main();
module.exports = new ReviewManagement();
