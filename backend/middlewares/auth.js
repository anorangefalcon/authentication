const jwt = require('jsonwebtoken');
const SECRET_KEY = 'falconHeHeAckerman';
const passwordState = require('./../controllers/password_state')

const auth = async(req, res, next) => {
    const token = req.headers?.authorization?.split(' ')[1] || req.body.resetToken;
    console.log(token);
    let shouldReset = true;
    if (req.body.resetToken){
        shouldReset = await passwordState.checkPasswordStateStatus(token);
    }

    if (!token || !shouldReset) return res.status(401).json({ message: 'Token not found :(' });
    try {
        const details = jwt.verify(token, SECRET_KEY);
        req.user = details;
        next();
    } catch (err) {
        if(err.expiredAt){
            res.status(400).json({ message: 'Token expired' });
        }
        res.status(401).json({ message: 'Invalid Token' });
    }
}

module.exports = auth;