const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        lowercase: true
    },
    password: {
        type: String,
        required: function () {
            return !this.providerId;
        },
        default: null,
        minlength: 8,
        match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    },
    providerId: {
        id: {
            type: String,
            unique: true,
            default: null
        },
        provider: {
            type: String,
            enum: ['GOOGLE', 'FACEBOOK'],
            // default: null
        }
    },
    type: {
        type: String,
        required: true,
        enum: ['admin', 'user'],
        default: 'user'
    },
    userDetails: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: 'UserDetails'
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Leads'
    }
},
    {
        timestamps: true,
        autoIndex: true
    });

userSchema.pre('save', async function (next) {
    if (this.password === null) {
        next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
});
userSchema.pre('update', async function (next) {
    if (this.password === null) {
        next();
    }
    const hashedPassword = await bcrypt.hash(this.password, 10);
    this.password = hashedPassword;
    next();
});

module.exports = mongoose.model('Users', userSchema);