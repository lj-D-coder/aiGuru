import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
import { UsersGenData } from "../models/usersGeneratedData.js";
import hitCounter from '../utils/counter.js'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ask_queries = async (req, res) => {
  try {
    const data = req.body.filters;
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

    var userMessage = `${req.body.content} ? ${filter}: `;
    console.log(`Question: ${userMessage}`);

    const chat = await openai.chat.completions.create({
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
                url: req.body.base64Image,
              },
            },
          ],
        },
      ],
      model: "gpt-4-turbo",
    });
    console.log(`Answer: ${chat.choices[0].message.content}`);
    res
      .status(200)
      .json({
        data: {
          question: userMessage,
          response: chat.choices[0].message.content,
        },
        statusCode: 1,
        error: "No error",
      });

    const newUserData = {
      userId: req.body.userId,
      question: userMessage,
      answers: chat.choices[0].message.content,
    };
    const user = await UsersGenData.create(newUserData);
    var count = await hitCounter("65bbae0ef201573df4ed646f");
    console.log(`Total Api Hit count: ${count}`);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};
