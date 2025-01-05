module.exports = (req, res, next) => {
    const redisClient = req.app.get('redisClient');
    const key = req.originalUrl;
    redisClient.get(key).then((data) => {
        if (data) {
            return res.json(JSON.parse(data));
        }
        next();
    }).catch((err) => next(err));
};
