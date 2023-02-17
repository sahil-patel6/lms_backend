const { sendEmail } = require("../utilities/email");
const {
  createEmailBodyForUserCredentialsMail,
  createEmailBodyForAssignmentCreatedMail,
} = require("../utilities/mail_generator");
const Student = require("../models/student");
const Assignment = require("../models/assignment");

module.exports = function (agenda) {
  agenda.define("send user credentials email", async (job) => {
    const { name, email, password } = job.attrs.data;
    const emailBody = createEmailBodyForUserCredentialsMail(job.attrs.data);
    console.log(job.attrs.data);
    await sendEmail({
      from: process.env.EMAIL,
      to: email,
      subject: "Your User Credentials For LMS Login",
      html: emailBody,
    });
  });

  agenda.define("send assignment created mail", async (job) => {
    try {
      let assignment = job.attrs.data;
      assignment = await Assignment.findById(assignment._id).populate({
        path: "subject",
        select: "-__v -createdAt -updatedAt",
        populate: { path: "semester", select: "-__v -createdAt -updatedAt" },
      });
      const students = await Student.find({
        semester: assignment.subject.semester._id,
      });
      students.forEach(async (student)=>{
        const emailBody = createEmailBodyForAssignmentCreatedMail(student,assignment);
        await sendEmail({
          from: process.env.EMAIL,
          to:student.email,
          subject: `New Assignment has been uploaded in ${assignment.subject.name}`,
          html: emailBody
        })
      })
    } catch (error) {
      console.log(error);
    }
  });

  // More email related jobs
};
