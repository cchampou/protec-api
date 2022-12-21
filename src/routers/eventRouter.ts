import { Router } from 'express';
import Event from '../entities/Event';
import User, { UserInterface } from '../entities/User';
import Notifier from '../services/Notifier';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
  const events = await Event.find();

  res.send(events);
});

eventRouter.get('/:id', async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
    });

    return res.send(event);
  } catch (error) {
    return res.status(404).send({ message: 'Not found' });
  }
});

eventRouter.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.send(event);
  } catch (error) {
    return res.status(400).send(error);
  }
});

eventRouter.post('/:id/notify/:mode', async (req, res) => {
  const eventId = req.params.id;
  const mode = req.params.mode;
  if (mode !== 'email' && mode !== 'push' && mode !== 'phone' && mode !== 'sms')
    return res.status(400).send({ message: 'Invalid mode' });
  const notifier = new Notifier({
    mode,
    eventId,
  });
  const users: UserInterface[] = await User.find();
  users.map((user) => {
    notifier.notify(user);
  });
  res.send({ message: 'Notification sent' });
});

export default eventRouter;
