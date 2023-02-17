const Assignment = require("../models/assignment");

module.exports = function (agenda) {
  agenda.define("close assignment submission", async (job) => {
    try {
      const assignment = job.attrs.data;
      await Assignment.updateOne({_id:assignment._id}, {
        isSubmissionAllowed: false,
      });
      console.log("SUCCESS");
    } catch (error) {
      console.log(error);
    }
  });
};
