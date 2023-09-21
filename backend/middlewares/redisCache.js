const redisClient = require('./../config/redisClient');

const checkRedisCache = async (req, res, next) => {
    // console.log(JSON.stringify(req.query));
    let url = req.originalUrl.split(/[=/]/).join('').split('?')[0];
    const suffix = (Object.keys(req.query).length > 0) ? JSON.stringify(req.query) :
        (req.body.email) ? req.body.email : req.user.email;

    const key = url + ':' + suffix;
    console.log(key, 'outside');

    try {
        redisClient.get(key).then((data) => {
            if (data) {
                data = JSON.parse(data);
                if (data.header) {
                    console.log('inside header');
                    res.set(data.header);
                    delete data.header;
                }
                console.log('completed redis');
                res.status(201).json(data);
            }
            else {
                console.log('not cached in redis, moving to actual funtion');
                next();
            }
        })
    } catch (error) {
        res.status(401).json({ message: 'unable to fetch redis cache' });
    }

}

module.exports = checkRedisCache;