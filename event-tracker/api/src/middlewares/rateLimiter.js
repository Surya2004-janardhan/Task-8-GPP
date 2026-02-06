const rateLimits = new Map();

const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 50;

    if (!rateLimits.has(ip)) {
        rateLimits.set(ip, {
            count: 1,
            resetTime: now + windowMs
        });
        return next();
    }

    const userData = rateLimits.get(ip);

    if (now > userData.resetTime) {
        // Reset window
        userData.count = 1;
        userData.resetTime = now + windowMs;
        return next();
    }

    if (userData.count >= maxRequests) {
        const retryAfter = Math.ceil((userData.resetTime - now) / 1000);
        res.set('Retry-After', retryAfter.toString());
        return res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
            retryAfter
        });
    }

    userData.count += 1;
    next();
};

module.exports = rateLimiter;
