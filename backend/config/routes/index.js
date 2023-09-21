const express = require('express');
const router = express.Router();

router.use('/', require('./v1/users'));
router.use('/details', require('./v1/user_details'));

router.use(function(req, res){
    return res.status(404).json({
        success: false,
        error: 'error.E_NOT_FOUND'
    });
})

module.exports = router;