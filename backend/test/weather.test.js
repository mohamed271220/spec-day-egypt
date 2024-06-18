const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../index.js'); // Adjust the path to your server file
const should = chai.should();

chai.use(chaiHttp);

describe('Weather API', () => {
    // Test for city weather
    describe('/GET weather/:city', () => {
        it('it should GET weather for a specific city', (done) => {
            chai.request(server)
                .get('/api/weather/666fe699364dff3819580458')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });

    // Test for all cities weather
    describe('/GET weather/cities', () => {
        it('it should GET weather for all cities', (done) => {
            chai.request(server)
                .get('/api/weather/cities?=search=cairo')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });

    // Test for country cities weather
    describe('/GET weather/cities/:countryCode', () => {
        it('it should GET weather for all cities in a specific country', (done) => {
            chai.request(server)
                .get('/api/weather/cities/EG')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    done();
                });
        });
    });

    // Test for location weather
    describe('/GET weather/location', () => {
        it('it should GET weather for a specific location', (done) => {
            chai.request(server)
                .get('/api/weather/location?lat=30.0444&lon=31.2357')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
        });
    });
});
