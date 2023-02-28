const admin = require("./firebase_admin");

const sendNotification = async function (payload) {
  const result = await admin.messaging().sendMulticast(payload);
  console.log(result);
};

module.exports = sendNotification;