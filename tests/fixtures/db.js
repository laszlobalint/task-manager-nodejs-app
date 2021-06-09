const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Task = require('../../src/models/task');
const User = require('../../src/models/user');

const testId1 = new mongoose.Types.ObjectId();
const testUser1 = {
  _id: testId1,
  name: 'Test User',
  email: 'test@abcdefg.com',
  password: 'Test321?',
  tokens: [
    {
      token: jwt.sign({ _id: testId1 }, process.env.JWT_SECRET),
    },
  ],
};

const testId2 = new mongoose.Types.ObjectId();
const testUser2 = {
  _id: testId2,
  name: 'Jane Dane',
  email: 'jane@dane.com',
  password: 'Rest321?',
  tokens: [
    {
      token: jwt.sign({ _id: testId2 }, process.env.JWT_SECRET),
    },
  ],
};

const testTask1 = {
  _id: new mongoose.Types.ObjectId(),
  description: 'First task',
  completed: false,
  owner: testUser1._id,
};

const testTask2 = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Second task',
  completed: true,
  owner: testUser1._id,
};

const testTask3 = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Second task',
  completed: true,
  owner: testUser2._id,
};

const setupDatabase = async () => {
  await User.deleteMany();
  await Task.deleteMany();
  await new User(testUser1).save();
  await new User(testUser2).save();
  await new Task(testTask1).save();
  await new Task(testTask2).save();
  await new Task(testTask3).save();
};

module.exports = {
  testId1,
  testUser1,
  testId2,
  testUser2,
  testTask1,
  testTask2,
  testTask3,
  setupDatabase,
};
