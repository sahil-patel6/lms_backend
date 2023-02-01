const Agenda = require("agenda");
require("dotenv").config();
const connectionOpts = {
  db: { address:process.env.DATABASE, collection: "agendaJobs" },
};

const agenda = new Agenda(connectionOpts);

require("./jobs/email")(agenda);
(async function () {
  await agenda.start();
  console.log("AGENDA STARTED")
})();

module.exports = agenda;