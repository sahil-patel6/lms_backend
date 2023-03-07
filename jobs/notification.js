const sendNotification = require("../notifications");
const Student = require("../models/student");
const Assignment = require("../models/assignment");
const moment = require("moment");

module.exports = function (agenda) {
  agenda.define("send assignment created notification", async (job) => {
    try {
      let assignment = job.attrs.data;
      console.log(assignment);
      assignment = await Assignment.findById(assignment._id).populate({
        path: "subject",
        select: "-__v -createdAt -updatedAt",
        populate: { path: "semester", select: "-__v -createdAt -updatedAt" },
      });
      const students = await Student.find({
        semester: assignment.subject.semester._id,
      });
      registration_tokens = [];
      students.map((student) => {
        if (student.fcm_token) {
          registration_tokens.push(student.fcm_token);
        }
      });
      console.log(registration_tokens);

      let utcDate = moment(assignment.dueDate);
      // Convert the UTC date into IST
      let istDate = moment(assignment.dueDate).tz("Asia/Kolkata");

      console.log("Using Moment.js:");
      console.log(`UTC date (iso): ${utcDate.format('llll')}`);
      console.log(`IST date (iso): ${istDate.format('llll')}`);
      if (registration_tokens.length != 0) {
        sendNotification({
          notification: {
            title: `New Assigment Uploaded in ${assignment.subject.name}`,
            body: `Assignment Title: ${
              assignment.title
            }\nAssignment Description: ${
              assignment.description
            }\nAssignment Due Date: ${istDate.format('llll')}`,
          },
          data: {
            assignment_id: assignment._id.toString(),
          },
          tokens: registration_tokens,
        });
      } else {
        console.log("NO FCM TOKENS TO SEND NOTIFICATIONS TO.....");
      }
    } catch (error) {
      console.log(error);
    }
  });
};
