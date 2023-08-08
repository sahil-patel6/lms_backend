require("dotenv").config();
const nodemailer = require("nodemailer");

const createTransporter = async () => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
      user: process.env.EMAIL,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  })
  
  return transporter;
};

exports.sendEmail = async (emailOptions) => {
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(emailOptions,function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

// sendEmail({
//   subject: "Test",
//   text: "I am sending an email from nodemailer!",
//   to: "xoxesa9943@ekcsoft.com",
//   from: process.env.EMAIL,
// });
