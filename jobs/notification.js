const sendNotification = require("../notifications");
const Student = require("../models/student");
const Assignment = require("../models/assignment");

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
      registration_tokens = []
      students.map((student) => {
        if (student.fcm_token) {
          registration_tokens.push(student.fcm_token);
        }
      });
      console.log(registration_tokens);
      if (registration_tokens.length != 0) {
        sendNotification({
          notification: {
            title: `New Assigment Uploaded in ${assignment.subject.name}`,
            body: `Assignment Title: ${assignment.title}\n
              Assignment Description: ${assignment.description}\n
              Assignment Due Date: ${assignment.dueDate.toLocaleString()}`,
          },
          data: {
            assignment_id: assignment._id,
          },
          token: [students.map((student) => student.fcm_token)],
        });
      }else{
        console.log("NO FCM TOKENS TO SEND NOTIFICATIONS TO.....")
      }
    } catch (error) {
      console.log(error);
    }
  });
};
