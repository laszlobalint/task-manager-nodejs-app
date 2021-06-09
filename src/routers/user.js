const express = require('express');
const sharp = require('sharp');
const router = new express.Router();
const authentication = require('../middlewares/authentication');
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
const User = require('../models/user');
const upload = require('../uploads/multer');

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();

    res.status(200).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.post('/users/logout', authentication, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
    await req.user.save();

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
});

router.post('/users/logout-all', authentication, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();

    res.status(200).send();
  } catch (error) {
    res.status(500).send();
  }
});

router.get('/user', authentication, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/users', async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/user', authentication, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['name', 'password', 'email', 'age'];

  if (!updates.every((update) => allowed.includes(update))) return res.status(400).send({ error: 'Invalid updates!' });

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();

    res.status(200).send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/user', authentication, async (req, res) => {
  try {
    await req.user.remove();
    sendCancellationEmail(req.user.email, req.user.name);
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) throw new Error();

    res.set('Content-Type', 'image/png');
    res.send(user.avatar);
  } catch (error) {
    res.status(404).send();
  }
});

router.post(
  '/user/avatar',
  authentication,
  upload.single('avatar'),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.status(200).send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error: error.message });
  },
);

router.delete('/user/avatar', authentication, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();

    res.status(200).send();
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
