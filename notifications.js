const admin = require("./firebase_admin");

const registrationToken =
  "eqrru9rhQi-nDuf7-fzC98:APA91bEMcqx5NGNjIql6cvbJSMIZKL9NlQf-dJtKTlNWExidOXZCR73Qp3F6GOsnpPuYcgyikY8BLn4BUujix39VBmtnQPp2iavVdvTz2rgKNY7XSSPg_wZxg7o-1rjtL5528N4B7z6G";

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