const { sendEmail } = require("../utilities/email");
const {
  createEmailBodyForUserCredentialsMail,
  createEmailBodyForAssignmentCreatedMail,
  createEmailBodyForAbsentAttendanceMail,
} = require("../utilities/mail_generator");
const Student = require("../models/student");
const AttendanceSession = require("../models/attendance_session");
const Assignment = require("../models/assignment");
const Parent = require("../models/parent");

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
      assignment = await Assignment.findById(assignment._id).populate({
        path: "subject",
        select: "-__v -createdAt -updatedAt",
        populate: { path: "semester", select: "-__v -createdAt -updatedAt" },
      });
      const students = await Student.find({
        semester: assignment.subject.semester._id,
      });
      const parents = [];
      for await (const student of students) {
        const parent = await Parent.findOne({ students: [student._id] });
        if (parent) {
          parents.push(parent);
        }
      }
      const emailBody = createEmailBodyForAssignmentCreatedMail(assignment);
      console.log(
        "students mail for assignment created mail",
        students.map((student) => student.email)
      );
      console.log(
        "parents mail for assignment created mail",
        parents.map((parent) => parent.email)
      );
      if (students.length != 0) {
        /// SENDING MAILS TO STUDENTS
        await sendEmail({
          from: process.env.EMAIL,
          to: students.map((student) => student.email),
          subject: `New Assignment has been uploaded in ${assignment.subject.name}`,
          html: emailBody,
        });
      }
      if (parents.length != 0) {
        /// SENDING MAILS TO PARENTS
        await sendEmail({
          from: process.env.EMAIL,
          to: parents.map((parent) => parent.email),
          subject: `Your child has got a new assignment in ${assignment.subject.name}`,
          html: emailBody,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  agenda.define("send attendance absent mail", async (job) => {
    try {
      let attendance_session = job.attrs.data;
      attendance_session = await AttendanceSession.findById(
        attendance_session._id
      )
        .populate("subject", "_id name")
        .populate("attendances.student", "_id name email");
      const emailBodyForStudent =
        createEmailBodyForAbsentAttendanceMail(attendance_session);
      const emailBodyForParent = createEmailBodyForAbsentAttendanceMail(
        attendance_session,
        true
      );
      var emails = [];
      var students = [];
      attendance_session.attendances.map((attendance) => {
        if (!attendance.present) {
          emails.push(attendance.student.email);
          students.push({
            _id: attendance.student._id,
            name: attendance.student.name,
          });
        }
      });
      
      const parents = [];
      for await (const student of students) {
        const parent = await Parent.findOne({ students: [student._id] });
        if (parent) {
          parents.push(parent);
        }
      }
      console.log(
        "Attendance Emails",
        emails,
        parents.map((parent) => parent.email)
      );
      /// SENDING MAILS TO STUDENTS
      if (emails.length != 0) {
        await sendEmail({
          from: process.env.EMAIL,
          to: emails,
          subject: `You have been marked absent in ${attendance_session.subject.name}`,
          html: emailBodyForStudent,
        });
      }
      /// SENDING MAILS TO PARENTS
      if (parents.length != 0) {
        await sendEmail({
          from: process.env.EMAIL,
          to: parents.map((parent) => parent.email),
          subject: `Your child has been marked absent in ${attendance_session.subject.name}`,
          html: emailBodyForParent,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
  // More email related jobs
};
