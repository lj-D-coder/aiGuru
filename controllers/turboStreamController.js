import OpenAI from "openai";
import dotenv from "dotenv";
import { UsersGenData } from "../models/usersGeneratedData.js";
import hitCounter from "../utils/counter.js";
import { Tiktoken } from "tiktoken/lite";
import { load } from "tiktoken/load";
import { SubscriberModel } from "../models/subscribersModel.js";
import models from "tiktoken/model_to_encoding.json" with { type: "json" };
import registry from "../node_modules/tiktoken/registry.json" with { type: "json" };

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

let extraTokenCharges = process.env.TOKEN_DEDUCTION_TAX;
if (!extraTokenCharges) { extraTokenCharges = 100 };

// streaming function starts here

export const turboStreamChat = async (socket, param) => {
  let data = param;
  console.log(data);
  console.log("=============User Request data ===============")
  const base64Images = data.base64Images;
  const model = await load(registry[models["gpt-4-turbo"]]);
  const encoder = new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);

  let completionTokens = 0;
  var filterText = "";

  if (data.filters["summarize"]) {
    filterText = data.filters["marks"] === 0 ? "summarize" : `summarize in ${data.filters["marks"]} marks`;
  } else if (data.filters["explainToKid"]) {
    filterText =
      data.filters["marks"] === 0 ? "explain to 5 years old" : `explain to 5 years old ${data.filters["marks"]} marks`;
  } else if (data.filters["custom"]) {
    filterText = data.filters["custom"];
  } else {
    filterText = data.filters["marks"] > 0 ? `in ${data.filters["marks"]} marks` : "";
  }

  var chatContent;
  var mathsFormat = "";
  var subject = data.filters["subject"];
  if (subject === "Maths" || subject === "Physics" || subject === "Chemistry") {
    var mathsFormat = "If calculation is there, provide simple solution do not over complicate things and return compatible format for flutter_tex based on latex";
  }

  if (data.query === "") {
    var chatContent = [
      {
        type: "text",
        text: ` your are ${subject} AI assistant, ${filterText}`,
      },
      ...base64Images.map(url => ({
        type: "image_url",
        image_url: {
          "url": url,
        },
      }))
    ];
  } else {
    var userQuestion = `${data.query} ? ${filterText}`;
    console.log(`Question: ${userQuestion}`);
    chatContent = userQuestion;
  }

  console.log("=============Following is Chat Content data ===============")
  console.log(chatContent)

  const instruction = `Instructions: Give clear, precise simplified answers.\n- assist students writing improvement\n- if answers is long structure properly\n- Avoid repetition.\n- be concise.\n ${mathsFormat}`;

  // requesting chat gpt response
  try {
    var completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `your are ${subject} AI Tutor.\n ${instruction}`,
        },
        {
          role: "user",
          content: chatContent,
        },
      ],
      model: "gpt-4o",
      stream: true,
      temperature: 0.3,
    });

    //response

    let arr_answer = [];
    for await (const chunk of completion) {
      let message = chunk.choices[0].delta.content;
      if (message) {
        arr_answer.push(message);
        socket.emit("answer-stream", `${message}`);
        try {
          // Your code here
          const tokenList = encoder.encode(message);
          completionTokens += tokenList.length;
        } catch (error) {
          console.error("An error occurred:", error);
        }
        // console.log(message);
      }
    }

    socket.disconnect(console.log("socket disconnected"));

    const answer = arr_answer.join("");
    console.log(answer);
    console.log(`Completion token usage: ${completionTokens}`);
    const totalTokenConsumption = (completionTokens + extraTokenCharges);
    console.log(`extra token usage: ${extraTokenCharges}`);

    if (completionTokens > 0 && data.userId) {
      const tokenDeduct = await SubscriberModel.findOneAndUpdate(
        { userId: data.userId },
        { $inc: { "subscription_info.token": -totalTokenConsumption } },
        { upsert: true }
      );
    }

    encoder.free();
    const newUserData = {
      userId: data.userId,
      question: "Recent Scan",
      answers: answer,
    };
    await UsersGenData.create(newUserData);
    var count = await hitCounter("65bbae0ef201573df4ed646f");
    console.log(`Total Api Hit count: ${count}`);
    completion = null; // resetting socket data
  } catch (error) {
    console.log(error);
  }
};
