const  Mailgen = require('mailgen');

var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        name: 'LMS',
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
                'Welcome to LMS! We\'re very excited to have you on board.',
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

exports.createEmailBodyForAssignmentCreatedMail = (student,assignment)=>{
    const emailGen = {
        body: {
            greeting: "Hello",
            signature: "Sincerely",
            name: student.name,
            intro: [
                `New Assignment has been uploaded in ${assignment.subject.name}`,
                `Assignment Title: ${assignment.title}`,
                `Assignment Description: ${assignment.description}`,
                `Assignment Due Date: ${assignment.dueDate.toLocaleString()}`
            ],
            outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };
    const emailBody = mailGenerator.generate(emailGen);
   return emailBody;
}  