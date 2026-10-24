const serverless = require('serverless-http');
const app = require('../../backend_ai/app');

exports.handler = serverless(app);