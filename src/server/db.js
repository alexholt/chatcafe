const MongoClient = require('mongodb').MongoClient;

const mongoUrl = 'mongodb://localhost:27017/chatcafe';
const limit = 10;

let database;
let collection;

module.exports = {

  connect: function (cb) {
    MongoClient.connect(mongoUrl, function(err, db) {
      if (err) {
        console.error('Could not connect to the database');
        process.exit();
      }
      database = db; 
      collection = db.collection('messages');
      cb();
    });
  },

  close: function () {
    database.close();
  },

  writeMessages: function (messages, cb) {
    collection.insertMany(messages, function (err, results) {
      if (err) {
        console.error(
          `Could not write to the database: ${err.code} ${err.message}`
        );
      } else {
        cb();
      }
    });    
  },

  writeMessage: function (message, cb) {
    collection.insert(message, function (err, results) {
      if (err) {
        console.error(
          `Could not write to the database: ${err.code} ${err.message}`
        );
      } else {
        module.exports.deleteOldMessages(cb);
      }
    });    
  },

  readMessages: function (cb) {
    collection.find({}).sort({timestamp: -1}).limit(limit)
      .toArray(function (err, docs) {
        if (err) {
          console.error(
            `Could not read from the database: ${err.code} ${err.message}`
          );
        } else {
          cb(docs);
        }
      });
  },

  deleteAll: function (cb) {
    collection.drop(function (err, result) {
      // A collection that doesn't exist gives a 26 error when attempting to
      // drop it
      if (err && err.code !== 26) {
        console.log(`Unable to drop collection: ${err.code} ${err.message}`);
      } else {
        cb();
      }
    }); 
  },

  deleteOldMessages: function (cb) {
    module.exports.getHighestId( function (err, id) {
      // Delete old messages taking care to handle the case where id wrapped
      // around back to zero
      collection.deleteMany({ $or: [ { id: { $lt: id - 100 }}, { id: { $gt: id }}]}, 
        function (err) {
          if (err) {
            console.error(
              `Could not delete from the database: ${err.code} ${err.message}`
            );

          } else {
            cb();
          }
        }
      );
    });
  },

  getHighestId: function (cb) {
    collection.find({}).sort({id: -1}).limit(1).toArray(
      function (err, docs) {
        let doc = docs[0];
        if (err) {
          console.log(`Unable to find highest id: ${err.code} ${err.message}`);
        }
        cb(err, doc.id >= Number.MAX_SAFE_INTEGER ? 0 : doc.id);
      }
    );
  },
};
