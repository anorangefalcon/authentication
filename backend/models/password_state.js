const mongoose = require('mongoose');

const password_state_Schema = mongoose.Schema({
    token: {
        type: String,
        unique: true
    }
});

module.exports = mongoose.model('passwordState', password_state_Schema);