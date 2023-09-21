const UserDetails = require('../models/user_details');

module.exports = {

    createUserDetails: async (req, res) => {
        input = req.body || req;
        console.log(input, "input---1");
        if (input.provider === 'FACEBOOK') {
            input.photoUrl = input.response?.picture?.data?.url;
        }
        const userDetails = await UserDetails.create({
            basic: input.basicDetails || null,
            education: input.education || null,
            experience: input.experience || null,
            'basic.name': input.name || null,
            'basic.image': input.picture || null,
        });
        return userDetails._id;
    },

    updateUserDetails: async (req, res) => {
        input = req.body;
        console.log(input, "input");

        await UserDetails.updateOne(
            { _id: req.userDetailId },
            {
                $set: {
                    basic: input.basicDetails,
                    education: input.education,
                    experience: input.experience
                }
            }
        );
    }
}