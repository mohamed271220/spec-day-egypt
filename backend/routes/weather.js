const express = require('express');
const weatherController = require('../controllers/weather');
const router = express.Router();
const updateWeatherMiddleware = require('../middlewares/updateWeatherMiddleware');

router.get('/:city', updateWeatherMiddleware, weatherController.getCityWeather);
router.get('/cities', weatherController.getAllCitiesWithWeather);
router.get('/cities/:countryCode', updateWeatherMiddleware, weatherController.getCitiesByCountryCode);
router.get('/location', updateWeatherMiddleware, weatherController.getWeatherByLocation);

module.exports = router;
