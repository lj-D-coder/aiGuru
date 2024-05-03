import OpenAI from "openai";
import dotenv from "dotenv";
import { UsersGenData } from "../models/usersGeneratedData.js";
import chalk from "chalk";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// streaming function starts here

export const turboStreamChat = async (socket, param) => {
  let data = param;
  console.log(data);
  const base64Image = data.base64Image;
  var filter = "";

  if (data.filters["summarize"]) {
    filter = data.filters["marks"] === 0 ? "summarize" : `summarize in ${data.filters["marks"]} marks`;
  } else if (data.filters["explainToKid"]) {
    filter =
      data.filters["marks"] === 0 ? "explain to 5 years old" : `explain to 5 years old ${data.filters["marks"]} marks`;
  } else {
    filter = data.filters["marks"] > 0 ? `in ${data.filters["marks"]} marks` : "";
  }

  // requesting chat gpt response
  try {
    var completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "AI Tutor Instructions: Give clear, precise answers .\n- assist students writing improvement\n- Structure long answers\n- Avoid repetition.\n- be concise.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `What's in this image? ${filter}` },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      model: "gpt-4-turbo",
      stream: true,
      max_tokens: 2000,
      // Set max-token based on user free/premium
    });

    let arr_answer = [];
    for await (const chunk of completion) {
      let message = chunk.choices[0].delta.content;
      if (message === undefined) {
        socket.disconnect(console.log("socket disconnected"));
      }
      arr_answer.push(message);
      socket.emit("answer-stream", `${message}`);
    }

    const answer = arr_answer.join("");
    console.log(answer);
    console.log(chalk.blue(line).toString());

    const newUserData = {
      userId: data.userId,
      question: userMessage,
      answers: answer,
    };
    await UsersGenData.create(newUserData);
    completion = null; // resetting socket data
  } catch (error) {
    console.log(error);
  }
};
