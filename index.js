'use strict';
const axios = require('axios');
const constants = require('./utils/constants');

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
      result.name = businessPromiseValue.value.data.name;
      result.city = businessPromiseValue.value.data.location.city;
      result.street = businessPromiseValue.value.data.location.address3;
      return result;
    } else {
      return {message: constants.YELP_REVIEWS_ERROR, code: constants.YELP_ERROR};
    }
  }

  getTopReview(reviewPromiseValue){
    if (reviewPromiseValue.status === constants.PROMISE_FULFILLED){
      let reviews = reviewPromiseValue.value;
      this.sort(reviews.data.reviews, constants.RATING);
      reviews = reviews.data.reviews;
      return reviews[reviews.length - 1];
    } else {
      return {message: constants.YELP_REVIEWS_ERROR, code: constants.YELP_ERROR};
    }
  }

  async getBusinessClientReviews(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_REVIEWS_URL;
    relativeUrl = relativeUrl.replace('{}', businessId);
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}`;
    let headers = {
      headers: {
        Authorization: `Bearer ${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return axios.get(businessInfoUrl, headers);
  }

  async getBusinessInfo(businessId){
    let relativeUrl = constants.YELP_FUSION_GET_BUSINESS_INFO_URL;
    let businessInfoUrl = `${process.env.YELP_FUSION_URL}/${relativeUrl}/${businessId}`;
    let headers = {
      headers: {
        Authorization: `Bearer ${process.env.YELP_FUSION_TOKEN}`,
      },
    };
    return axios.get(businessInfoUrl, headers);
  }

  async getBestReview(businessId){
    let reviewsPromise = this.getBusinessClientReviews(businessId);
    let businessInfoPromise = this.getBusinessInfo(businessId);
    let promResArray = await Promise.allSettled([businessInfoPromise, reviewsPromise]);
    let topReview = this.getTopReview(promResArray[1]);
    let businessInfo = this.formatBusinessInfo(promResArray[0]);
    let result = this.formatResponse(topReview, businessInfo);
    return result;
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
