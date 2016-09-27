const expect = require('chai').expect;

const DB = require('../src/server/db.js');
const dbName = 'test';

describe('DB', function () {

  before(function (done) {
    DB.connect(dbName, function (err, subject) {
      DB.dropCollection(function (err, reply) {
        done();  
      });
    });
  });

  after(function () {
    DB.dropCollection(function (err, reply) {
      DB.close();
    });
  });

  it('should provide a connection to the database', function (done) {
    DB.connect(dbName, function (err) {
      expect(err).to.not.exist;
      expect(DB.getDatabase()).to.exist;
      done(); 
    }); 
  });

  it('should provide the highest id with no existing records', function (done) {
    DB.getHighestId(function (err, id) {
      expect(err).to.not.exist;
      expect(id).to.equal(0); 
      done();
    });
  });

  it('should provide the highest id with existing records', function (done) {
    DB.writeMessages([{ id: 99 }, { id: 100 }], function () {
      DB.getHighestId(function (err, id) {
        expect(err).to.not.exist;
        expect(id).to.equal(100); 
        done();
      });
    });
  });

  it('should allow reading and writing of messages', function (done) {
    DB.writeMessages([{ id: 101, body: 'hello' }], function (err) {
        expect(err).to.not.exist;

        DB.readMessages(function (err, messages) {
          expect(err).to.not.exist;
          let foundIt = false;
          for (let i = 0; i < messages.length; i++) {
            if (messages[i].body === 'hello' && messages[i].id === 101) {
              foundIt = true;
            }
          }
          expect(foundIt).to.be.truthy;
          done();
        });
    });
  });

});
