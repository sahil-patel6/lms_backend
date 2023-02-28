const admin = require("./firebase_admin");

const sendNotification = async function (payload) {
  const result = await admin.messaging().send(payload);
  console.log(result);
};

module.exports = sendNotification;