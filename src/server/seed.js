const db = require('./db');
const sampleData = require('./sample_data.json');

db.connect(function () {
  db.deleteAll(function () {
    db.writeMessages(sampleData, function () {
      db.close();
    });
  });
});
