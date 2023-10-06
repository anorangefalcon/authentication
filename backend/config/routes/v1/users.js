const express = require('express');
const router = express.Router();
const controller = require('./../../../controllers/users');
const auth = require('./../../../middlewares/auth');
const checkRedisCache = require('./../../../middlewares/redisCache');
const passwordState = require('../../../controllers/password_state');

// router.use(checkRedisCache);
// router.post('/', checkRedisCache, controller.authenticate);
router.post('/', controller.authenticate);
router.post('/forgotPassword', controller.forgotPassword);

router.post('/login',  controller.login);
router.post('/signup', controller.signup);

router.use(auth);
router.post('/updatePassword', controller.updatePassword)
router.get('/login', checkRedisCache, controller.login);
router.post('/fetchUserDetails', controller.fetchUserDetails)
router.post('/updateUserDetails', controller.updateUser)
router.post('/fetchAllUsers', checkRedisCache, controller.fetchAllUsers)
router.post('/deleteUser', controller.deleteUser)

module.exports = router;