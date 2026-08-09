import { Router } from 'express';
import { createMessage, getMessages } from '../controllers/message.controller';

const router = Router();

router.post('/', createMessage);
router.get('/', getMessages);

export default router;
