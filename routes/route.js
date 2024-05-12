import express from 'express';
import { ques_ans, feedback , userProfile} from '../controllers/usersDataController.js';
import { checkout, createSession } from '../controllers/stripeController.js';
import { tokenUpdate, getToken } from '../controllers/tokenController.js';
import { sendEmail } from '../controllers/nodeMailerController.js';
const router = express.Router();

router.post('/user/queries', ques_ans);
router.post('/send/feedback', feedback);
router.post('/fetch/user-profile',userProfile);
router.post('/create-checkout-session', checkout);
router.post('/create-portal-session', createSession);
router.post('/token', tokenUpdate);
router.get('/token', getToken);
router.post('/sendmail', sendEmail);


export default router;