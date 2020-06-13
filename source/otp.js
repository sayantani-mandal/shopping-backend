function generateOtp(email){
    const otpGenerator = require('otp-generator');
    const token = otpGenerator.generate(4, {upperCase: false, alphabets: false, specialChars: false});
    //console.log(token);
    return token;
}
//generateOtp('ssaayyantani@gmail.com');
module.exports = generateOtp;