const mongoose = require('mongoose');

const leadSchema = mongoose.Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
},
{
    timestamps: true,
    autoindex: true
}
);

module.exports = mongoose.model('Leads', leadSchema);