const User = require('../models/user');
const bcrypt = require('bcryptjs');
const userDetailsController = require('./../controllers/user_details');
const leadsController = require('./../controllers/leads');
const mailer = require('./../services/mailer');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'falconHeHeAckerman';
const redisClient = require('./../config/redisClient');
const auth_expiry_time = 3600;
const func_expiry_time = 4800;
const {OAuth2Client} = require('google-auth-library');
const passwordState = require('./../controllers/password_state');

module.exports = {
    
    authenticate: async (req, res) => {
        console.log('inside authenticate Controller');
        try {
            let input = req.body;
            // doesn't verifies just decodes the data
            // const hehe = decodeJwtResponse(input.credential);
            // console.log(hehe, 'hehe');

            // also reverifies the token/data [better]
            if(input.credential){
                const googleOathClient = new OAuth2Client();
                const ticket = await googleOathClient.verifyIdToken({
                    idToken: input.credential,
                    audience: input.client_id
                });
                input = ticket.getPayload();
                input.provider = 'GOOGLE';
            }

            const user = await User.findOne({
                email: input.email
            });

            let resultObj = {
                message: 'Going to login',
                status: 'active',
                emailExists: true
            };

            if (!user) {
                const leadID = await leadsController.getLeadId(input);
                if (leadID === false) {
                    await leadsController.createLead(input);
                }
                resultObj.message = 'Going to signup';
                resultObj.emailExists = false;
            }

            if (user?.status === 'inactive') {
                resultObj.message = 'User is inactive';
                resultObj.emailExists = true;
                resultObj.status = 'inactive';
            }

            if (user?.providerId.id && !(input.credential)) {
                resultObj.message = 'User is registered with a provider';
                resultObj.emailExists = true;
                resultObj.provider = user.providerId.provider;
            }
        
            redisClient.setEx(`:${input.email}`, auth_expiry_time, JSON.stringify(resultObj));

            return res.status(200).json(resultObj)

        } catch (error) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }
        // function decodeJwtResponse(token) {
        //     var base64Payload = token.split(".")[1];
        //     var payloadBuffer = Buffer.from(base64Payload, "base64");
        //     return JSON.parse(payloadBuffer.toString());
        // }
    },

    login: async (req, res) => {
        console.log('inside login Controller');
        try {
            let input = (Object.keys(req.body).length > 0) ? req.body : req.user;
            if(input.credential){
                const googleOathClient = new OAuth2Client();
                const ticket = await googleOathClient.verifyIdToken({
                    idToken: input.credential,
                    audience: input.client_id
                });
                input = ticket.getPayload();
                input.provider = 'GOOGLE';
                input.id = input.sub;
            }
            const user = await User.findOne({
                email: input.email
            });

            let resultObj = {
                access: false
            }

            const token = jwt.sign({
                email: user.email,
                userId: user._id,
                type: user.type,
            }, SECRET_KEY, { expiresIn: '120s' });

            if (((input?.provider === user.providerId.provider) && (input?.id === user.providerId.id)) 
            || req.user || (await bcrypt.compare(input?.password, user?.password))
                
            ) {
                console.log('heyy');
                resultObj.header = {
                    'Authorization': `Bearer ${token}`
                };
                resultObj.access = true;
                resultObj.email = user.email;
                resultObj.type = user.type;
            }
            else {
                res.status(200).json({
                    message: 'Invalid credentials',
                    access: false
                });
                return;
            }

            redisClient.setEx(`login:${input.email}`, auth_expiry_time, JSON.stringify(resultObj));
            res.status(201).header(resultObj.header).json(resultObj);

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Internal server error'
            });
        }
    },

    signup: async (req, res) => {
        try {
            console.log('inside signup Controller');
            let input = req.body;
            
            if(input.credential){
                const googleOathClient = new OAuth2Client();
                const ticket = await googleOathClient.verifyIdToken({
                    idToken: input.credential,
                    audience: input.client_id
                });
                input = ticket.getPayload();
                input.provider = 'GOOGLE';
                input.id = input.sub;
            }
            const leadID = await leadsController.getLeadId(input);

            let user = {};
            if (input.provider) {
                console.log('inside provider', input.provider);
                user = await User.create({
                    email: input.email,
                    'providerId.id': input.id,
                    'providerId.provider': input.provider,
                    lead: leadID
                });
                await module.exports.updateUser({body: input});
            }
            else {
                user = await User.create({
                    email: input.email,
                    password: input.password,
                    lead: leadID
                });
            }
            console.log(user, 'ejjeje');
            mailer.sendTheMail(input.email);

            const token = jwt.sign({
                email: user.email,
                userId: user._id,
                type: user.type,
            }, SECRET_KEY, { expiresIn: '20s' });

            console.log(user, token);
            let resultObj = {
                header: {
                    Authorization: `Bearer ${token}`
                },
                access: true,
                email: user.email,
                type: user.type,
            };

            redisClient.setEx(`login:${input.email}`, auth_expiry_time, JSON.stringify(resultObj));
            res.status(201).header(resultObj.header).json(resultObj);

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: 'Unable to create user right now', error
            });
        }
    },

    fetchUserDetails: async (req, res) => {
        console.log('inside fetchUser Controller');
        try {
            const input = (req.body.admin)? req.body : req.user;
            if (input.admin) {
                if (!(module.exports.authenticateAdmin(req.user.email))) {
                    res.status(200).json({
                        message: 'You are not an admin'
                    });
                }
            }

            let user;
            if(input.userId){
                user = await User.findById(input.userId, {email: 1, userDetails: 1}).populate('userDetails');;
            }
            else{
                user = await User.findOne(
                    { email: input.email },
                    { email: 1, userDetails: 1 }).populate('userDetails');
            }

            redisClient.setEx(`fetchUserDetails:${input.email}`, func_expiry_time, JSON.stringify({
                user
            }));
            
            res.status(200).json({
                user
            });
            
        } catch (error) {
            res.status(500).json({
                message: "Unable to fetch this user's details right now", error
            });
        }
    },

    updateUser: async (req, res) => {
        try {
            const input = req.body;
            console.log(input);
            redisClient.DEL(`fetchUserDetails:${input?.email}`);

            if (input?.basicDetails?.email !== req.user?.email && !(input?.provider)) {
                if (!(await module.exports.authenticateAdmin(req.user?.email))) {
                    return res.status(200).json({
                        message: "You are not an admin, Cannot update other user's details."
                    });
                }
                input.email = input.basicDetails.email;
            }

            console.log(input.email, 'input email');
            const user = await User.findOne({ email: input?.email });
            console.log(user, 'user');
            if (!(user.userDetails)) {
                user._id = await userDetailsController.createUserDetails(req);
                await User.updateOne({ email: input.email }, { $set: { userDetails: user._id } });

                if (input.provider) {
                    return;
                }
                return res.status(200).json({
                    message: 'User created successfully'
                });
            }
            else {
                const input = req.body;
                const user = await User.findOne({ email: input.email });

                const newReq = {
                    userDetailId: user.userDetails,
                    body: input
                }

                await userDetailsController.updateUserDetails(newReq);
                return res.status(200).json({
                    message: 'User updated successfully'
                });
            }
            

        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Unable to update this user's details right now", error
            });
        }
    },

    authenticateAdmin: async (req, res) => {
        try {
            const user = await User.findOne({
                email: req
            });
            if (user.type === 'admin') {
                return true;
            }
            return false;
        }
        catch (error) {
            return res.status(500).json({
                message: 'Internal server error, unable to verify admin'
            });
        }
    },

    forgotPassword: async (req, res) => {   
        try {
            req.body.email = req.body.email.toLowerCase();
            const user = await User.findOne({
                email: req.body.email
            }, {'email': 1,'userId': 1, 'password': 1});

            const token = jwt.sign({
                userId: user._id,
                password: user.password
            }, SECRET_KEY, { expiresIn: '90s' });

            await passwordState.createPasswordChangeState(token);

            mailer.resetPasswordMail({
                email: user.email,
                token: token
            });

            return res.status(200).json({linkSent: true})
            
        } catch (error) {
            res.status(500).json({
                linkSent: false,
                message: "Unable to update password right now", error
            });
        }
    },

    updatePassword: async (req, res) =>{
        console.log(req.user);
        console.log(req.body.password);
    
        const user = await User.findById(req.user.userId);

        if(await bcrypt.compare(req.body?.password, user?.password)){
            return res.status(400).json({
                message: 'Cannot set same password as before'
            })
        }

        if(user.password === req.user.password){
            await User.updateOne({email: user.email}, {$set: {'password': await bcrypt.hash(req.body.password, 10)}});
            res.status(200).json({
                passwordReset: true
            })
        }
        else{
            res.status(400).json({
                passwordReset: false,
                message: 'Unable to reset password due to server error'
            })
        }
    },

    // strictly for admin only

    fetchAllUsers: async (req, res) => {
        try {
            let query = {
                type: 'user',
                status: 'active'
            };

            let page = Number(req.query.page) || 1;
            let limit = Number(req.query.limit) || 3;
            let skip = (page - 1) * limit;
            let sortBy = 'createdAt';
            let sortOptions = {};
            isAdmin = await module.exports.authenticateAdmin(req.user.email);

            if (req.query) {
                if (req.query.type) {
                    query.type = req.query.type;
                }
                if (req.query.status) {
                    query.status = req.query.status;
                }
                if (req.query.search) {
                    query.$or = [
                        { email: { $regex: req.query.search, $options: 'i' } },
                        { "userDetails.basic.name": { $regex: req.query.search, $options: 'i' } }
                    ];
                }
                if (req.query.sortBy) {
                    if (req.query.sortBy === 'email' || req.query.sortBy === 'createdAt') {
                        sortBy = req.query.sortBy;
                    }
                    else {
                        sortBy = 'userDetails.basic.' + req.query.sortBy;
                    }
                }
                sortOptions[sortBy] = 1;
            }

            if (isAdmin) {
                console.log(JSON.stringify(req.query), 'idhar');
                // const users = await User.find(query, { email: 1 })
                // .populate('userDetails')
                // .skip(skip).limit(limit).sort(sortOptions);

                const users = await User.aggregate([
                    {
                        $lookup: {
                            from: 'userdetails',
                            localField: 'userDetails',
                            foreignField: '_id',
                            as: 'userDetails'
                        }
                    },
                    {
                        $sort: sortOptions
                    },
                    {
                        $match: {
                            type: query.type,
                            status: query.status
                        }
                    },
                    {
                        $match: {
                            $or: [
                                { "email": { $regex: req.query.search, $options: 'i' } },
                                { "userDetails.basic.name": { $regex: req.query.search, $options: 'i' } },
                            ]
                        }
                    },
                    {
                        $skip: skip
                    },
                    {
                        $limit: limit
                    },

                ]);

                users.forEach(user => {
                    user.userDetails = user.userDetails[0];
                });
                const total = await User.countDocuments(query);

                if (users.length === 0) {
                    return res.status(200).json({
                        message: 'No users found',
                        users: []
                    });
                }
                redisClient.setEx(`fetchAllUsers:${JSON.stringify(req.query)}`, 1000, JSON.stringify({ users, total }));
                res.status(200).json({
                    users,
                    total
                });
            }
            else {
                res.status(200).json({
                    message: 'You are not an admin'
                });
            }
        } catch (error) {
            res.status(500).json({
                message: "Unable to fetch users right now", error
            });
        }
    },

    deleteUser: async (req, res) => {
        try {
            input = req.body;
            if (module.exports.authenticateAdmin(req.user.email)) {
                // const user = await User.updateOne({email: input.user}, {$set: {status: "inactive"}});
                try {
                    const user = await User.updateOne({ email: input.user }, { $set: { status: "inactive" } });
                } catch (error) {
                    console.error(error);
                }
                return res.status(200).json({
                    message: 'User deleted successfully'
                });
            }
            else {
                return res.status(200).json({
                    message: 'Cannot Delete a User, you are not an admin'
                });
            }
            
        } catch (error) {
            res.status(500).json({
                message: "Unable to delete this user right now", error
            });
        }
    }
}
