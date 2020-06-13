const {testAccount_user, testAccount_pass} = require('./private');
const nodemailer = require('nodemailer');
const email = 'ssaayyantani@gmail.com';

// async..await is not allowed in global scope, must use a wrapper
async function sendEMail(email,otp) {
  
   // console.log(otp);
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  //let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount_user, // generated ethereal user
      pass: testAccount_pass // generated ethereal password
    }
  });
 // console.log(email);

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: "horrorlawrence@gmail.com", // sender address
    to: email, // list of receivers
    subject: "Your OTP", // Subject line
    text: otp, // plain text body
    html: `<h2>${otp}</h2>` // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

//sendEMail().catch(console.error);

module.exports = sendEMail;