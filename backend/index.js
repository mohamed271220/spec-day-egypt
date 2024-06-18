const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const weatherRoutes = require('./routes/weather'); // Import the routes
const { register, login } = require('./routes/auth');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// app.post('api/register', register);
// app.post('api/login', login);
app.use('/api/weather', weatherRoutes);

mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });

module.exports = app; 