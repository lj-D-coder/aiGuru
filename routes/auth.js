import express from 'express';
import { signup, signin, saveGoogleinfo , deleteAccount} from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signup);
router.post('/login', signin);
router.post('/save-google-info', saveGoogleinfo);
router.post('/deactivate-permanently', deleteAccount);


export default router;
