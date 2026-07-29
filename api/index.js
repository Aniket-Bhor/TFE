// Vercel Serverless Function entry point
// Routes all /api/* requests through our Express server

const app = require('../server.js');

module.exports = app;
