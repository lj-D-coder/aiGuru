import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

const openai_api_key = process.env.OPENAI_API_KEY;


const openai = new OpenAI({
    apiKey: openai_api_key
  });
  
  
  router.post('/ask-queries', async (req, res) => {
    console.log(req.body);
    const userMessage = req.body.content;
  
    try {
      const chat = await openai.chat.completions.create({
        messages: [{ role: 'user', content: userMessage }],
        model: 'gpt-3.5-turbo',
      });
      console.log(chat.choices[0].message.content);
      res.status(200).json({ data: { response: chat.choices[0].message.content } ,statusCode: 1, error:"No error"});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  });


  export default router;
