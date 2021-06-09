const request = require('supertest');
const app = require('../src/app');
const Task = require('../src/models/task');
const { testUser1, testUser2, testTask1, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
    .send({ description: 'Test task to do.' })
    .expect(201);

  const task = await Task.findById(response.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toEqual(false);
});

test('Should return all tasks for user', async () => {
  const response = await request(app).get('/tasks').set('Authorization', `Bearer ${testUser1.tokens[0].token}`).send().expect(200);

  expect(response.body.length).toBe(2);
});

test('Should not delete another user`s task', async () => {
  await request(app).delete(`/tasks/${testTask1._id}`).set('Authorization', `Bearer ${testUser2.tokens[0].token}`).send().expect(404);

  const task = await Task.findById(testTask1._id);
  expect(task).not.toBeNull();
});
