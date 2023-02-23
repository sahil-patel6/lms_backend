const admin = require("firebase-admin");

const serviceAccount = require("./credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken =
  "fC8ZwzPaQaKRLPIl-eNjW3:APA91bGtRDO67CzlId0iUmD1q58knLUZM1lLYu98u_FuUUzU_W3FAAm_Nme4q1W8Eu_orQUH4hsPvfOWgRJMBuY0Q0odxZ8NFlnrQSWnHDl5Cf-6cRaE3E9up2qBJp7h4cUezwEAp5SX";

const sendNotification = async function (payload) {
  const result = await admin.messaging().send(payload);
  console.log(result);
};

sendNotification({
  notification: {
    title: "HELLO SK",
    body: "BC",
  },
  data: {
    score: "sdsdg",
    time: Date.now().toLocaleString(),
  },
  token: registrationToken,
});

module.exports = sendNotification;