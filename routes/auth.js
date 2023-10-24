import express from 'express';
import { signup, signin, saveGoogleinfo } from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signup);
router.post('/login', signin);
router.post('/save-google-info', saveGoogleinfo);


export default router;
