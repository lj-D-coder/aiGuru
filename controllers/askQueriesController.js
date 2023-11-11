import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
import { UsersGenData } from "../models/usersGeneratedData.js";

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

    var userMessage = `${filter}: ${req.body.content}`;
    console.log(`Question: ${userMessage}`);

    const chat = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "AI Tutor Instructions: Give clear, precise answers to grade-related questions.\n- Directly assist students in answer writing for improved scores.\n- Structure long answers (5+ marks) if needed.\n- Avoid repetition.\n- be concise.",
        },
        { role: "user", content: userMessage },
      ],
      model: "gpt-3.5-turbo",
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
    console.log(user);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing your request." });
  }
};
