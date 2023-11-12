import express from 'express';
import { ques_ans, feedback } from '../controllers/usersDataController.js';
import { stripeHook } from '../controllers/stripeController.js';
const router = express.Router();

router.post('/user/queries', ques_ans);
router.post('/send/feedback', feedback);
router.post('/hook-stripe', express.raw({ type: 'application/json' }), stripeHook);

export default router;