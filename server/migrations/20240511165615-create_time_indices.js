module.exports = {
  async up(db, client) {
    await db.collection('appointments').createIndex({startTime: -1, endTime: -1, doctorId: 1});
    await db.collection('blocks').createIndex({startTime: -1, endTime: -1, doctorId: 1});
  },

  async down(db, client) {
    await db.collection('appointments').dropIndex({startTime: -1, endTime: -1, doctorId: 1});
    await db.collection('blocks').dropIndex({startTime: -1, endTime: -1, doctorId: 1});
  }
};
