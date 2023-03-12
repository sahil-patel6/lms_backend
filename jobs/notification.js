const sendNotification = require("../notifications");
const Student = require("../models/student");
const Parent = require("../models/parent")
const Assignment = require("../models/assignment");
const AttendanceSession = require("../models/attendance_session");
const moment = require("moment");

module.exports = function (agenda) {
  agenda.define("send assignment created notification", async (job) => {
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
      registration_tokens_for_students = [];
      registration_tokens_for_parents = [];
      students.map((student) => {
        if (student.fcm_token) {
          registration_tokens_for_students.push(student.fcm_token);
        }
      });

      const parents = [];
      for await (const student of students) {
        const parent = await Parent.findOne({ students: [student._id] });
        if (parent) {
          parents.push(parent);
        }
      }
      // const parents = await Parent.find({
      //   "students": students.map((student) => student._id),
      // });
      parents.map((parent) => {
        if (parent.fcm_token) {
          registration_tokens_for_parents.push(parent.fcm_token);
        }
      });
      console.log(
        "Registration tokens for assignment notifications",
        registration_tokens_for_students,
        registration_tokens_for_parents
      );

      let utcDate = moment(assignment.dueDate);
      // Convert the UTC date into IST
      let istDate = moment(assignment.dueDate).tz("Asia/Kolkata");

      console.log("Using Moment.js:");
      console.log(`UTC date (iso): ${utcDate.format("llll")}`);
      console.log(`IST date (iso): ${istDate.format("llll")}`);
      if (registration_tokens_for_students.length != 0) {
        sendNotification({
          notification: {
            title: `New Assigment Uploaded in ${assignment.subject.name}`,
            body: `Assignment Title: ${
              assignment.title
            }\nAssignment Description: ${
              assignment.description
            }\nAssignment Due Date: ${istDate.format("llll")}`,
          },
          data: {
            assignment_id: assignment._id.toString(),
          },
          tokens: registration_tokens_for_students,
        });
      } else {
        console.log("NO STUDENTS FCM TOKENS TO SEND NOTIFICATIONS TO.....");
      }

      if (registration_tokens_for_parents.length != 0) {
        sendNotification({
          notification: {
            title: `Your child has got a new assignment in ${assignment.subject.name}`,
            body: `Assignment Title: ${
              assignment.title
            }\nAssignment Description: ${
              assignment.description
            }\nAssignment Due Date: ${istDate.format("llll")}`,
          },
          data: {
            assignment_id: assignment._id.toString(),
          },
          tokens: registration_tokens_for_parents,
        });
      } else {
        console.log("NO PARENTS FCM TOKENS TO SEND NOTIFICATIONS TO.....");
      }
    } catch (error) {
      console.log(error);
    }
  });

  agenda.define("send attendance absent notification", async (job) => {
    try {
      let attendance_session = job.attrs.data;
      attendance_session = await AttendanceSession.findById(
        attendance_session._id
      )
        .populate("subject", "_id name")
        .populate("attendances.student", "_id name fcm_token");
      registration_tokens_for_students = [];
      registration_tokens_for_parents = [];
      var students = [];
      attendance_session.attendances.map((attendance) => {
        if (!attendance.present && attendance.student.fcm_token) {
          registration_tokens_for_students.push(attendance.student.fcm_token);
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
      // const parents = await Parent.find({
      //   "students": students.map((student) => student._id),
      // });
      parents.map((parent) => {
        if (parent.fcm_token) {
          registration_tokens_for_parents.push(parent.fcm_token);
        }
      });
      console.log(
        "attendance absent notification registration tokens",
        registration_tokens_for_students,
        registration_tokens_for_parents
      );
      let istStartTime = moment(attendance_session.start_time).tz(
        "Asia/Kolkata"
      );
      let istEndTime = moment(attendance_session.end_time).tz("Asia/Kolkata");

      console.log("Using Moment.js:");
      console.log(`istStartTime: ${istStartTime.format("llll")}`);
      console.log(`istEndTime: ${istEndTime.format("llll")}`);
      if (registration_tokens_for_students.length != 0) {
        sendNotification({
          notification: {
            title: `You have been marked absent`,
            body: `This is to inform you that you have been marked absent in ${
              attendance_session.subject.name
            } for session ${istStartTime.format("llll")} to ${istEndTime.format(
              "llll"
            )}`,
          },
          data: {
            attendance_session: attendance_session._id.toString(),
          },
          tokens: registration_tokens_for_students,
        });
      } else {
        console.log("NO STUDENTS FCM TOKENS TO SEND NOTIFICATIONS TO.....");
      }
      if (registration_tokens_for_parents.length != 0) {
        sendNotification({
          notification: {
            title: `Your child has been marked absent`,
            body: `This is to inform you that your child has been marked absent in ${
              attendance_session.subject.name
            } for session ${istStartTime.format("llll")} to ${istEndTime.format(
              "llll"
            )}`,
          },
          data: {
            attendance_session: attendance_session._id.toString(),
          },
          tokens: registration_tokens_for_parents,
        });
      } else {
        console.log("NO PARENTS FCM TOKENS TO SEND NOTIFICATIONS TO.....");
      }
    } catch (error) {
      console.log(error);
    }
  });
};
