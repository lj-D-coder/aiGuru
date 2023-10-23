import express from 'express';
import {ask_queries} from '../controllers/askQueriesController.js';

const askQueries = express.Router();

  askQueries.post('/',ask_queries);


  export default askQueries;
