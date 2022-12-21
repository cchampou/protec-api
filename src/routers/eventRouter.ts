import { Router } from 'express';
import Event from '../entities/Event';

const eventRouter = Router();

eventRouter.get('/', async (req, res) => {
  const events = await Event.find();

  res.send(events);
});

eventRouter.post('/', async (req, res) => {
  try {
    const event = await Event.create(req.body);
    res.send(event);
  } catch (error) {
    return res.status(400).send(error);
  }
});

export default eventRouter;
