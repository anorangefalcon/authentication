const mongoose = require('mongoose');

const educationSchema = mongoose.Schema({
    percentage: {
        type: Number,
        trim: true,
        required: true,
        default: 0
    },
    institution: {
        type: String,
        trim: true,
        required: true,
        default: ''
    },
    degree: {
        type: String,
        trim: true,
        required: true,
        default: ''
    },
    year: {
        from:{
            type: Number,
            required: true,
            default: 0
        },
        to:{
            type: Number,
            required: true,
            default: 0
        }
    }
});

const experienceSchema = mongoose.Schema({
    company: {
        type: String,
        trim: true,
        required: true
    },
    designation: {
        type: String,
        trim: true,
        required: true
    },
    year:{
        from:{
            type: Number
        },
        to:{
            type: Number
        }
    },
});

const userDetailsSchema = mongoose.Schema({
    basic:{
        name: {
            type: String,
            required: true,
            trim: true,
            default: 'Anonymous'
        },
        image: {
            type: String
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        mobile: {
            type: Number,
            required: true,
            trim: true,
            default: 0
        },
        address: {
            city: {
                type: String
            },
            state: {
                type: String
            },
            country: {
                type: String
            }
        }
    },
    education: [educationSchema],
    experience: [experienceSchema]
},
    {
        timestamps: true,
        autoIndex: true
    }
);

module.exports = mongoose.model('UserDetails', userDetailsSchema);