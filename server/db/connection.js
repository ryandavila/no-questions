const monk = require('monk');
const db = monk(process.env.MONGODB_URI || 'localhost:27017/questions');
db.then(() => {
  console.log('Properly connected to server...')
});

module.exports = db;