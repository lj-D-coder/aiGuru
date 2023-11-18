import express from 'express';
import { ques_ans, feedback } from '../controllers/usersDataController.js';
import { checkout, createSession, stripeWebhook } from '../controllers/stripeController.js';
const router = express.Router();

router.post('/user/queries', ques_ans);
router.post('/send/feedback', feedback);
router.post('/create-checkout-session', checkout);
router.post('/create-portal-session', createSession);

export default router;