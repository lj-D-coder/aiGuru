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

// streaming function starts here

export const turboStreamChat = async (socket, param) => {
  let data = param;
  console.log(data);
  console.log("============================the above is the request data from the app ============================");
  const base64Images = data.base64Images;
  if (base64Images || base64Images.length !== 0) {
    var imageContent = base64Images.map((imageUrl) => ({
      type: "image_url",
      image_url: {
        url: imageUrl,
      },
    }));
  }

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
    var mathsFormat = "If calculation is there return compatible format for flutter_tex based on latex";
  }

  if (data.query === "") {
    var chatContent = [
      {
        type: "text",
        text: `Analyze this image if is maths problem solve it accurately, if not answer the question accurately? ${filterText}`,
      },
      ...imageContent,
    ];
  } else {
    var userQuestion = `${data.query} ? ${filterText}`;
    console.log(`Question: ${userQuestion}`);
    chatContent = userQuestion;
  }

  const instruction = `Instructions: Give clear, precise answers.\n- assist students writing improvement\n- Structure long answers\n- Avoid repetition.\n- be concise.\n ${mathsFormat}`;

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
      temperature: 0.2,
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
    if (completionTokens > 0 && data.userId) {
      const tokenDeduct = await SubscriberModel.findOneAndUpdate(
        { userId: data.userId },
        { $inc: { "subscription_info.token": -completionTokens } },
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
