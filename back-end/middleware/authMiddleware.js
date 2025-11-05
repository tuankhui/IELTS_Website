// authMiddleware.js
const jwt = require('jsonwebtoken');
// const secret = 'your_jwt_secret'; // Replace with a strong secret
require('dotenv').config();
const secret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    try{
        // const authHeader = req.body['headers']['Authorization'];
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        // console.log(req);
        // console.log(token)

        if (!token || token == "null") return res.sendStatus(401);
        // console.log("OK");
        jwt.verify(token, secret, (err, user) => {
            // console.log("OK");
            // console.log(err);
            if (err) return res.sendStatus(401);
            req.user = user;
            // console.log("OK");
            next();
        });
    }
    catch (error) {return res.sendStatus(401);}
};

const authorizeTeacher = (req, res, next) => {
    // console.log(req.user);
    if (req.user.role !== 'teacher' && req.user.role !== 'Teacher') {
        if(req.user.role !== 'admin' && req.user.role !== 'Admin'){
            return res.status(403).json({ message: 'Access denied. You are not authorized to perform this action.' });
        }
    }
    next();
};

const authenticateTokenContest = (req, res, next) => {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token || token == "null" || token == null) {
            req.user = null;
            return next();
        }

        jwt.verify(token, secret, (err, user) => {
            // console.log(err)
            if (err) return res.sendStatus(403);
            req.user = user;
            next();
        });
    }
    catch{
        req.user = null;
        console.log("here");
        return next();
    }
}

module.exports = {
    authenticateToken,
    authorizeTeacher,
    authenticateTokenContest
};

// module.exports = authenticateToken;
