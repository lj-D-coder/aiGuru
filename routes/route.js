import express from 'express';
import { ques_ans, feedback } from '../controllers/usersDataController.js';

const router = express.Router();

router.post('/user/queries', ques_ans);
router.post('/send/feedback', feedback);

export default router;