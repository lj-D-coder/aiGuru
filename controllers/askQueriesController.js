import OpenAI from 'openai';
import dotenv from 'dotenv';
//import axios from 'axios';
dotenv.config();
import {UsersGenData} from '../models/usersGeneratedData.js';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

export const ask_queries = async (req, res) => {  
  
  var data = req.body.filters;
  var filter='';
  
  if (data.summarize) {
      filter = data.marks === 0 ? 'summarize' : `summarize in ${data.marks} marks`;
  } else if (data.explainToKid) {
      filter = data.marks === 0 ? 'explain to me like I am 5 years old' : `explain to me like I am 5 years old for ${data.marks} marks`;
  } else {
      filter = data.marks > 0 ? `in ${data.marks} marks` : '';
  }

  var userMessage = `${req.body.content} ${filter}`;
  console.log(`Question: ${userMessage}`);

  try {






    const chat = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: "AI Tutor Guidelines: Provide clear, precise answers to grade-related queries.\n- Guide students directly in answer writing for better scores.\n- Structure long answers (5+ marks) with introduction, body, conclusion if needed.\n- Avoid unnecessary repetition.\n- Limit answers to under 1000 words, aim for brevity."
      },
        { role: 'user', content: userMessage }],
      model: 'gpt-3.5-turbo',
    });
    console.log(`Answer: ${chat.choices[0].message.content}`);
    res.status(200).json({ data: { question: userMessage,  response: chat.choices[0].message.content }, statusCode: 1, error: "No error" });

      const newUserData = {
      userId: req.body.userId,
      question: userMessage,
      answers: chat.choices[0].message.content,
  };
  const user = await UsersGenData.create(newUserData);
  console.log(user);
  
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
  
};





