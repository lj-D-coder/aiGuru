import OpenAI from "openai";
//import http from "http";
import dotenv from 'dotenv';
import {UsersGenData} from '../models/usersGeneratedData.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const streamData = (io) => async (req, res) => {
    
    try {
        const data = req.body.filters;
        var filter='';
        console.log(req.body);
        if (data.summarize) {
            filter = data.marks === 0 ? 'summarize' : `summarize in ${data.marks} marks`;
        } else if (data.explainToKid) {
            filter = data.marks === 0 ? 'explain to me like I am 5 years old' : `explain to me like I am 5 years old for ${data.marks} marks`;
        } else {
            filter = data.marks > 0 ? `in ${data.marks} marks` : '';
        }

        var user_query = `${filter}: ${req.body.content}`;
        console.log(`Question: ${user_query}`);
        
        const completion = await openai.chat.completions.create({
                  messages: [{
                    role: 'system',
                    content: "AI Tutor Instructions: Give clear, precise answers to grade-related questions.\n- Directly assist students in answer writing for improved scores.\n- Structure long answers (5+ marks) if needed.\n- Avoid repetition.\n- be concise."
                  },
                    { role: 'user', content: user_query }],
                  model: 'gpt-3.5-turbo',
                  stream: true,
                  max_tokens:500,
        });
        
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'X-Accel-Buffering': 'no',
      });
        let arr_answer = [];
          for await (const chunk of completion) {
            if (chunk === undefined) return;
            arr_answer.push(chunk.choices[0].delta.content);
            console.clear();
            res.write(`data: ${JSON.stringify(chunk.choices[0].delta.content)}\n\n`);
          }
        
        const answer = arr_answer.join('');
        console.log(answer);
        res.end();
        
        const newUserData = {
            userId: req.body.userId,
            question: user_query,
            answers: answer,
        };
        const saveData = await UsersGenData.create(newUserData);
        console.log(saveData);

} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
