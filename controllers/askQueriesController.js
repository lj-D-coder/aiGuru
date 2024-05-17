import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const ask_queries = async (req, res) => {
  try {
    let data = req.body;
    const base64Images = data.base64Images;
    var filterText = "";

    if (data.filters["summarize"]) {
      filterText = data.filters["marks"] === 0 ? "summarize" : `summarize in ${data.filters["marks"]} marks`;
    } else if (data.filters["explainToKid"]) {
      filterText =
        data.filters["marks"] === 0
          ? "explain to 5 years old"
          : `explain to 5 years old ${data.filters["marks"]} marks`;
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
        ...base64Images.map((url) => ({
          type: "image_url",
          image_url: {
            url: url,
          },
        })),
      ];
    } else {
      var userQuestion = `${data.query} ? ${filterText}`;
      console.log(`Question: ${userQuestion}`);
      chatContent = userQuestion;
    }

    // console.log("============================the above chat content ============================");

    console.log(chatContent);

    const instruction = `Instructions: Give clear, precise answers.\n- assist students writing improvement\n- Structure long answers\n- Avoid repetition.\n- be concise.\n ${mathsFormat}`;

    // requesting chat gpt response
    var chat = await openai.chat.completions.create({
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
      temperature: 0.2,
    });

    console.log(`Answer: ${chat.choices[0].message.content}`);
    res.status(200).json({
      data: {
        response: chat.choices[0].message.content,
      },
      statusCode: 1,
      error: "No error",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};
