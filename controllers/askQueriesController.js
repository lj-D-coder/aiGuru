import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();
import {Users} from '../models/usersModel.js';
 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

export const ask_queries = async (req, res) => {
  console.log(req.body);
  const userMessage = req.body.content;
  
  try {
    const chat = await openai.chat.completions.create({
      messages: [{ role: 'user', content: userMessage }],
      model: 'gpt-3.5-turbo',
    });
    console.log(chat.choices[0].message.content);
    res.status(200).json({ data: { response: chat.choices[0].message.content }, statusCode: 1, error: "No error" });
    const newUser = {
      name: "Tomnao",
      email: chat.choices[0].message.content,
      phoneNo: 12345611,
  };
  const user = await Users.create(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};