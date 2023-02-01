const {sendEmail} = require("../utilities/email")
const { createEmailBodyForUserCredentialsMail } = require("../utilities/mail_generator");

module.exports = function (agenda) {
  agenda.define("send user credentials email", async (job) => {
    const {name,email,password} = job.attrs.data;
    const emailBody = createEmailBodyForUserCredentialsMail(job.attrs.data);
    console.log(job.attrs.data);
    await sendEmail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your User Credentials For LMS Login",
        html: emailBody
    })
  });

  agenda.define("reset password", async (job) => {
    // Etc
  });

  // More email related jobs
};