import express from 'express';
import {ask_queries} from '../controllers/askQueriesController.js';
import { stream_queries } from '../controllers/streamController.js';

const router = express.Router();

router.post('/', ask_queries);
router.post('/stream',stream_queries);


  export default router;
