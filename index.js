require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
   intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", ()=>  {
  console.log("Bot is online");
  client.user.setActivity(
    "Duvet", 
    {
      type: ActivityType.Streaming
    })
});

const genAI = new GoogleGenerativeAI(process.env.g_apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const personalityData = JSON.parse(fs.readFileSync("personality.json","utf8"));
const botName = personalityData.name || "Tex";

const formattedExamples = personalityData.examples.map(conv =>conv.user ? `user: ${conv.user}\n${botName}: ${conv.bot}`: `${botName}: ${conv.bot}`).join("\n\n");


// Prefix can be either the defined prefix (e.g., "!") or the bot mention
const prefix = process.env.prefix || `<@${process.env.bot_ID}>`;

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  let content = message.content.trim();

  // If message doesn't start with bot mention or prefix, ignore it
  if (!(content.startsWith(prefix) || content.startsWith(`<@!${process.env.BOT_ID}>`))) return;

  // Remove bot mention or prefix from the message
  content = content.replace(new RegExp(`^<@!?${process.env.BOT_ID}>`), "").trim();
  if (content.startsWith(process.env.prefix)) content = content.slice(process.env.prefix.length).trim();

  // If message is empty after removing prefix/mention, reply with a generic response
  if (!content) {
    message.reply("Yes? How can I assist you?");
    return;
  }

  await execute(message, content);
});

async function execute(message, query) {
  try {
    const prompt =`You are "${botName}", ${persona},

Respond naturally in your own words, keeping responses short and playful when possible. Feel free to have no filter. Here are some things you might say:

"${formattedExamples}"

Now, respond to this input in your own way, without repeating the format above:

"${query}"`;;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const cleanResponse = response.replace(/^.*?:/,"").trim();
    message.reply(cleanResponse);
  } catch (error) {
    console.error("Error generating response:", error);
    message.reply("Sorry, I encountered an error while generating a response.");
  }
}

client.login(process.env.bot_token);
