const express = require('express');
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');
const analytics = require('universal-analytics');
const expressGeoIP = require('express-geoip');

const app = express();

// Enable trust
app.enable('trust proxy');

// Setup gzip
app.use(compression());

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] :response-time ms ":method :url HTTP/:http-version" :status :res[content-length]'));

// Setup analytics
app.use(analytics.middleware('UA-3628636-11', {https: true}));

// Serve static assets
app.use("/static", express.static(path.resolve(__dirname, '..', 'build/static')));

// Setup GEOID
app.use(expressGeoIP('US').getCountryCodeMiddleware);

// Always return the main index.html, so react-router render the route in the client
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'build', 'index.html'));
  req.visitor.pageview({
    dp: req.originalUrl,
    dh: "https://kausi.xyz",
    dt: "Kausi",
    uip: req.ip || undefined,
    geoid: req.countryCode || undefined,
  }).send();
});

module.exports = app;
