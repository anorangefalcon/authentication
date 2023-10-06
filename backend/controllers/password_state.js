const passwordState = require('../models/password_state');

module.exports = {
    checkPasswordStateStatus: async(req, res)=>{
        try {
            const token = req;
            const user = await passwordState.findOne({token: token});
            
            if(user){
                await passwordState.deleteOne({
                    "token": token
                });
                return true;
            }
            return false;
        } catch (error) {
            res.status(500).json({
                message: 'Unable to fulfil password change request', 
                error
            })
        }
    },
    createPasswordChangeState: async(req, res) =>{
        try {
            const token = req;
            await passwordState.create({
                token: token
            });
        } catch (error) {
            res.status(500).json({
                message: 'Unable to fulfil password change request', 
                error
            })
        }
    },

}