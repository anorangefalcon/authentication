const express = require('express');
const app = express();
const cors = require('cors');
require('./config/db');
const redisClient = require('./config/redisClient');
app.use(cors());
require('dotenv').config();


// idiotic thing to do for getting headers to the frontend
const corsOptions = {
    exposedHeaders: ['Authorization'],
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(require('./config/routes'));

redisClient.connect();

let port = process.env.PORT || 5500;
app.listen(port, (err) => {
    if (err) {
        console.log('Unable to run server');
    }
    else {
        console.log('Server running on port ' + port);
    }
});