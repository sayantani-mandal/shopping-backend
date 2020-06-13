const jwt = require('jsonwebtoken');
function auth(req,res,next){
const token = req.header('token');

if(!token) return res.status(401).send({Error: 'access denied. no token provided'});

try{
    const decoded = jwt.verify(token, "vidly_jwtPrivateKey");
    req.token = token;
    req.admin = decoded;
    next();
}
catch(ex){
    res.status(402).send('Invalid token..');
}
}

module.exports = auth;