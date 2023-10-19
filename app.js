const OpenAI = require('openai');
const express = require('express');
const app = express();
require('dotenv').config();


const openai_api_key = process.env.OPENAI_API_KEY;


const port = 5000; // You can change the port as needed

const openai = new OpenAI({
  apiKey: openai_api_key
});

app.use(express.json());

app.post('/ask-queries', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});




// app.get
// app.post
// app.put -- update
// app.delete
// app.all
// app.use -- middleware
// app.listen

/** 
app.get('/',(req, res)=>{
    res.status(200).send("Home page");
});

app.get('/about',(req, res)=>{
    res.send("About Page");
});

app.all('*',(req, res)=>{
    res.status(404).send("<h1>Resource Not found</h1>");
});


app.listen(5000, ()=>{
    console.log("server is running on port 5000...")
});

*/

// const http = require('http');

// const server = http.createServer((req, res)=>{
//     res.end("Hello world");
// });


// server.listen(5000, ()=>{
//     console.log("server listening on port: 5000...");
// });
