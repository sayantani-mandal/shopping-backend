const jwt = require('jsonwebtoken');
function auth(req,res,next){
const token = req.header('token');

if(!token) return res.status(401).send({Error: 'access denied. no token provided'});

try{
    const decoded = jwt.verify(token, "vidly_jwtPrivateKey");
    //console.log(decoded);
    req.token = token;
    req.user = decoded;
    next();
}
catch(ex){
    res.status(402).send('Invalid token..');
}
}

module.exports = auth;