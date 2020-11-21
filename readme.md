Overview
We love ice cream! Tell us what the top Ten ice cream shops in “Redwood City” are and why.
Requirements
● use the Yelp Fusion API
● output must include
    business name
    business address (street, city)
    excerpt from a review of that business
    name of the person that wrote the review

Prerequisites:
Yelp api credentials


Reference:
Yelp Apis:
REST API https://api.yelp.com/v3/businesses/{businessId}/reviews - to get reviews
Doc reference: https://www.yelp.com/developers/documentation/v3/business_reviews

REST API https://api.yelp.com/v3/businesses/{businessId} - to get business info

How to run:
1) npm i - To install libraries
2) npm start - to run from command line.

How to test?
1) npm test - To run unit tests

How to do integration tests?
1) Go to test/integration.
2) Run the indexTest.js file using debugger.

Debug configurations added for tests as well as index.js.