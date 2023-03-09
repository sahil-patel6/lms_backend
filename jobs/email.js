const { sendEmail } = require("../utilities/email");
const {
  createEmailBodyForUserCredentialsMail,
  createEmailBodyForAssignmentCreatedMail,
  createEmailBodyForAbsentAttendanceMail
} = require("../utilities/mail_generator");
const Student = require("../models/student");
const AttendanceSession = require("../models/attendance_session");
const Assignment = require("../models/assignment");

module.exports = function (agenda) {
  agenda.define("send user credentials email", async (job) => {
    try {
      const { name, email, password } = job.attrs.data;
      const emailBody = createEmailBodyForUserCredentialsMail(job.attrs.data);
      console.log(job.attrs.data);
      await sendEmail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your User Credentials For LMS Login",
        html: emailBody,
      });
    } catch (error) {
      console.log(error);
    }
  });

  agenda.define("send assignment created mail", async (job) => {
    try {
      let assignment = job.attrs.data;
      assignment = await AttendanceSession.findById(assignment._id).populate({
        path: "subject",
        select: "-__v -createdAt -updatedAt",
        populate: { path: "semester", select: "-__v -createdAt -updatedAt" },
      });
      const students = await Student.find({
        semester: assignment.subject.semester._id,
      });
      const emailBody = createEmailBodyForAssignmentCreatedMail(assignment);
      console.log([students.map((student) => student.email)]);
      await sendEmail({
        from: process.env.EMAIL,
        to: [students.map((student) => student.email)],
        subject: `New Assignment has been uploaded in ${assignment.subject.name}`,
        html: emailBody,
      });
    } catch (error) {
      console.log(error);
    }
  });
  agenda.define("send attendance absent mail", async (job) => {
    try {
      let attendance_session = job.attrs.data;
      attendance_session = await AttendanceSession.findById(attendance_session._id).populate("subject","_id name")
      .populate(
        "attendances.student",
        "_id name email"
      );
      const emailBody = createEmailBodyForAbsentAttendanceMail(attendance_session);
      var emails = [];
      attendance_session.attendances.map((attendance)=>{
        if (!attendance.present){
          emails.push(attendance.student.email);
        }
      })
      console.log(emails);
      if (emails.length != 0){
        await sendEmail({
          from: process.env.EMAIL,
          to: emails,
          subject: `You have been marked absent in ${attendance_session.subject.name}`,
          html: emailBody,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  // More email related jobs
};
