import OpenAI from "openai";
//import http from "http";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const stream_queries = async (req, res) => {
    const data = req.body.filters;
    var filter='';

    if (data.summarize) {
        filter = data.marks === 0 ? 'summarize' : `summarize in ${data.marks} marks`;
    } else if (data.explainToKid) {
        filter = data.marks === 0 ? 'explain to me like I am 5 years old' : `explain to me like I am 5 years old for ${data.marks} marks`;
    } else {
        filter = data.marks > 0 ? `in ${data.marks} marks` : '';
    }

    var userMessage = `${filter}: ${req.body.content}`;
    console.log(`Question: ${userMessage}`);
    try{
        const completion = await openai.chat.completions.create({
                  messages: [{
                    role: 'system',
                    content: "AI Tutor Instructions: Give clear, precise answers to grade-related questions.\n- Directly assist students in answer writing for improved scores.\n- Structure long answers (5+ marks) if needed.\n- Avoid repetition.\n- be concise."
                  },
                    { role: 'user', content: userMessage }],
                  model: 'gpt-3.5-turbo',
                  stream: true,
                });

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'X-Accel-Buffering': 'no',
      });
        let text = "";
          for await (const chunk of completion) {
            if (chunk === undefined) return;
            text += chunk.choices[0].delta.content;
            res.write(`data: ${JSON.stringify(chunk.choices[0].delta.content)}\n\n`);
          }
        console.log(text);
    res.end();

} catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
}
