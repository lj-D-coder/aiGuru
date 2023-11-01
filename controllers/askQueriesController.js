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
      data.mark === 0 ? "yes" : "no";
      filter = data.marks === 0 ? 'summarize' : `summarize in ${data.marks} marks`;
      console.log(filter);
  } else if (data.explainToKid) {
      filter = data.marks === 0 ? '   explain to me like I am 5 years old' : `explain to kids for ${data.marks} marks`;
  } else {
      filter = data.marks > 0 ? `in ${data.marks} marks` : '';
  }
  var userMessage = `${req.body.content} ${filter}`;
  console.log(`Question: ${userMessage}`);

  try {
    const chat = await openai.chat.completions.create({
      messages: [{
        role: 'system',
        content: "You are a master tutor. Use the following principles in responding to students:\n\n- Answers quetions with respect to grades, The answer should be precise and simple to understand\n- Guide students in their answers  writing providing direct answers, to enhance their scoring in exams.\n- optionally inculde introduction body and conclusion if required for long answer type qestion for example: for questions carring 5 marks or above.\n- Do not repete yourself just to lengthen the answer.\n- Set word limit to maximum 1000 words"
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





