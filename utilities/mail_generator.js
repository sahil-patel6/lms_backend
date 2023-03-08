const  Mailgen = require('mailgen');
const moment = require("moment")

var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'LearnSpot',
        copyright: 'Copyright © 2023 LMS. All rights reserved.',
        link: "https://www.google.com"
    }
});

exports.createEmailBodyForUserCredentialsMail = (data)=>{
    const {name,email,password} = data;
    const emailGen = {
        body: {
            greeting: "Hello",
            signature: "Sincerely",
            name: name,
            intro: [
                'Welcome to LearnSpot! We\'re very excited to have you on board.',
                'Please do not share your credentials with anyone.\nHere are your credentials:',
                `Your Email: <b>${email}</b>`,
                `Your Password: <b>${password}</b>`,
            ],
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    const emailBody = mailGenerator.generate(emailGen);
   return emailBody;
}  

exports.createEmailBodyForAssignmentCreatedMail = (assignment)=>{
    let utcDate = moment(assignment.dueDate);
      // Convert the UTC date into IST
      let istDate = moment(assignment.dueDate).tz("Asia/Kolkata");

      console.log("Using Moment.js:");
      console.log(`UTC date (iso): ${utcDate.format('llll')}`);
      console.log(`IST date (iso): ${istDate.format('llll')}`);
      
    const emailGen = {
        body: {
            greeting: "Hello",
            signature: "Sincerely",
            name: "There",
            intro: [
                `New Assignment has been uploaded in ${assignment.subject.name}`,
                `Assignment Title: ${assignment.title}`,
                `Assignment Description: ${assignment.description}`,
                `Assignment Due Date: ${istDate.format('llll')}`
            ],
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    const emailBody = mailGenerator.generate(emailGen);
   return emailBody;
}  