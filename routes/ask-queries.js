import express from 'express';
import {ask_queries} from '../controllers/askQueriesController.js';


const router = express.Router();

router.post('/', ask_queries);



  export default router;
