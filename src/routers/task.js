const express = require('express');
const router = new express.Router();
const authentication = require('../middlewares/authentication');
const Task = require('../models/task');

router.get('/tasks', authentication, async (req, res) => {
  const match = {};
  const sort = {};

  if (req.query.completed) match.completed = req.query.completed === 'true';

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':');
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
  }

  try {
    await req.user
      .populate({
        path: 'tasks',
        match,
        options: { limit: parseInt(req.query.limit), skip: parseInt(req.query.skip), sort },
      })
      .execPopulate();

    res.status(200).send(req.user.tasks);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.get('/tasks/:id', authentication, async (req, res) => {
  try {
    await Task.findOne({ _id: req.params.id, owner: req.user._id }).then((task) => {
      if (!task) return res.status(404).send();

      res.status(200).send(task);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/tasks', authentication, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });

  try {
    res.status(201).send(await task.save());
  } catch (error) {
    res.status(400).send(error);
  }
});

router.patch('/tasks/:id', authentication, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ['description', 'completed'];

  if (!updates.every((update) => allowed.includes(update))) return res.send(400).send({ error: 'Invalid updates!' });

  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

    if (!task) return res.status(404).send();

    updates.forEach((update) => (task[update] = req.body[update]));

    res.status(200).send(await task.save());
  } catch (error) {
    res.status(400).send(error);
  }
});

router.delete('/tasks/:id', authentication, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id }).then((task) => {
      if (!task) return res.status(404).send();

      res.status(200).send(task);
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
