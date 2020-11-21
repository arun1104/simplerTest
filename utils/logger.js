'use strict';
const constants = require('./constants');
const appName = constants.APP_NAME;
const env = process.env.NODE_ENV || constants.DEV;
const util = require('util');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp } = format;
const winstonLogger = createLogger({
  format: combine(
    timestamp(),
    format.json(),
    format.colorize(),
  ),
  transports: [new transports.Console()],
});
class Logger {
  constructor(corrId, method, apiName) {
    this.correlation_id = corrId;
    this.logger = winstonLogger;
    this.methodName = method;
    this.info = this.info.bind(this);
    this.error = this.error.bind(this);
    this.app = appName;
    this.env = env;
    this.apiName = apiName;
    this.timerStart = '';
  }
  startTime() {
    this.timerStart = new Date();
  }
  endTime(url) {
    let endTimeMessage = {
      app: this.app,
      env: this.env,
      level: constants.LOG_LEVEL_INFO,
      url: url,
      correlation_id: this.correlation_id,
      method: this.methodName,
      apiName: this.apiName,
      responseTime: new Date() - this.timerStart + ' ms',
    };
    endTimeMessage = JSON.parse(JSON.stringify(endTimeMessage));
    this.logger.log(endTimeMessage);
  }
  info(msg, obj, statusCode) {
    let infoMessage = {
      app: this.app,
      env: this.env,
      level: constants.LOG_LEVEL_INFO,
      message: msg,
      object: util.inspect(obj, true, null),
      statusCode: statusCode,
      correlation_id: this.correlation_id,
      method: this.methodName,
      apiName: this.apiName,
    };
    infoMessage = JSON.parse(JSON.stringify(infoMessage));
    this.logger.log(infoMessage);
  }
  error(msg, statusCode) {
    let messageToLog = {
      app: this.app,
      env: this.env,
      level: constants.LOG_LEVEL_ERROR,
      message: util.inspect(msg, true, null),
      statusCode: statusCode,
      correlation_id: this.correlation_id,
      method: this.methodName,
      apiName: this.apiName,
    };
    messageToLog = JSON.parse(JSON.stringify(messageToLog));
    this.logger.log(messageToLog);
  }
}
module.exports = Logger;
