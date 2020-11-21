'use strict';
const constants = require('./../utils/constants');
class CommonUtility{
  constructor(){
    this.formatDateToISO = this.formatDateToISO.bind(this);
    this.reduceTime = this.reduceTime.bind(this);
    this.formatTimeForTimeZone = this.formatTimeForTimeZone.bind(this);
    this.getTimeDifferenceInHours = this.getTimeDifferenceInHours.bind(this);
  }

  formatTimeForTimeZone(timestampUnix, timeZone){
    let date = new Date(timestampUnix);
    let temp = date.toLocaleDateString(constants.LOCALE, {timeZone});
    let splits = temp.split('/');
    let formattedDate = `${splits[1]}-${splits[0]}-${splits[2]}`;
    let timestamp = date.toLocaleTimeString(constants.LOCALE, {timeZone});
    let result = formattedDate + ' ' + timestamp;
    return result;
  }

  formatDateToISO(dateString){
    let date = new Date(dateString);
    return date.toISOString();
  }

  reduceTime(timestampUnix, valueToReduce){
    let result = timestampUnix - (valueToReduce * constants.ONE_HOUR_UNIX_TIMESTAMP * constants.MILLI_SECOND_FACTOR);
    return result;
  }

  getTimeDifferenceInHours(oldTime, newTime){
    let diff = (newTime - oldTime) / (constants.ONE_HOUR_UNIX_TIMESTAMP * constants.MILLI_SECOND_FACTOR);
    let result = Math.abs(Math.round(diff));
    return result;
  }
}

module.exports = new CommonUtility();
