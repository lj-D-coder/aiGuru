import OpenAI from "openai";
import dotenv from "dotenv";
import { UsersGenData } from "../models/usersGeneratedData.js";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const length = 100;
// Generate a line of #
const line = "#".repeat(length);

// streaming function starts here

export const streamChat = async (socket, param) => {
  let data = param;
  console.log(data);
  console.log(line, 'color: red');
  var filter = "";

  if (data.summarize) {
    filter =
      data.marks === 0 ? "summarize" : `summarize in ${data.marks} marks`;
  } else if (data.explainToKid) {
    filter =
      data.marks === 0
        ? "explain to me like I am 5 years old"
        : `explain to me like I am 5 years old for ${data.marks} marks`;
  } else {
    filter = data.marks > 0 ? `in ${data.marks} marks` : "";
  }

  var userMessage = `${filter}: ${data.query}`;
  console.log(`Question: ${userMessage}`);
  // Print the line to the console
  console.log(line, 'color: blue');
  try {
    var completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "AI Tutor: Give clear, precise answers",
        },
        { role: "user", content: userMessage },
      ],
      model: "gpt-3.5-turbo",
      stream: true,
      max_tokens: 100,
    });

    let arr_answer = [];
    for await (const chunk of completion) {
      let message = chunk.choices[0].delta.content;
      if (message === undefined) {
        socket.disconnect(
          console.log("socket disconnected")
        );
      }
      arr_answer.push(message);
      socket.emit("answer-stream", `${message}`);
    }

    const answer = arr_answer.join("");
    console.log(answer);
    console.log(line,'color: green');

    const newUserData = {
      userId: data.userId,
      question: userMessage,
      answers: answer,
    };
    const saveData = await UsersGenData.create(newUserData);
    completion = null; // resetting socket data

  } catch (error) {
    console.error(error);
  }
};
