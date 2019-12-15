const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    //As it is going to return a promise, we must have an await statement, we can either use fetch and catch or this.

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('MongoDB connected..');
  } catch (error) {
    console.error(error.message);
    //Exit
    process.exit(1);
  }
};

module.exports = connectDB;
