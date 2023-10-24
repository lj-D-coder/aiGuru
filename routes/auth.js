import express from 'express';
import { signup, signin } from '../controllers/authController.js';

const router = express.Router();

router.post('/sign-up', signup);
router.post('/login', signin);


export default router;
