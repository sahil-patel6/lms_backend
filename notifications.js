const admin = require("firebase-admin");

const serviceAccount = require("./credentials.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const registrationToken =
  "fClPTa4-RhK10Xrxccf2hR:APA91bGR-uuQvhrrs86tngRqZjB9xBsiR7h-lnlrqyl1zQath9Qwgyr9ayz41VjFrpjzYwDGTXmfGbsnjRhdZSL-8V_isVqgq87VQhmI9S5ocmsn2MIzfGfLcBLUsEzSQ5JcHi_mgPjf";

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