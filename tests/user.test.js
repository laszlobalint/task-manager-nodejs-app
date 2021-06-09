const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { testId1, testUser1, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'Supertest123',
    })
    .expect(201);

  const user = await User.findById(response.body.user._id);
  expect(user).not.toBeNull();

  expect(response.body).toMatchObject({
    user: {
      name: 'John Doe',
      email: 'john@doe.com',
    },
  });

  expect(user.password).not.toBe('Supertest123');
});

test('Should login a user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: testUser1.email,
      password: testUser1.password,
    })
    .expect(200);

  const user = await User.findById(testId1);
  expect(response.body.token).toBe(user.tokens[0].token);
});

test('Should not login non-existent user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUser1.email,
      password: 'random!password',
    })
    .expect(400);
});

test('Should get profile for user', async () => {
  await request(app).get('/user').set('Authorization', `Bearer ${testUser1.tokens[0].token}`).send().expect(200);
});

test('Should not get profile for unauthenticated user', async () => {
  await request(app).get('/user').send().expect(401);
});

test('Should delete account for user', async () => {
  await request(app).delete('/user').set('Authorization', `Bearer ${testUser1.tokens[0].token}`).send().expect(200);

  const user = await User.findById(testId1);
  expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
  await request(app).delete('/user').send().expect(401);
});

test('Should upload an avatar image', async () => {
  await request(app)
    .post('/user/avatar')
    .set('Authorization', `Bearer ${testUser1.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200);

  const user = await User.findById(testId1);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields', async () => {
  await request(app).patch('/user').set('Authorization', `Bearer ${testUser1.tokens[0].token}`).send({ name: 'Jane' }).expect(200);

  const user = await User.findById(testId1);
  expect(user.name).toBe('Jane');
});

test('Should not update invalid user fields', async () => {
  await request(app).patch('/user').set('Authorization', `Bearer ${testUser1.tokens[0].token}`).send({ company: 'IBM' }).expect(400);
});
