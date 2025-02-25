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
const prefix = process.env.prefix || process.env.prefix2 || `<@${process.env.bot_ID}>`;

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  let content = message.content.trim();

  // If the message is a reply to the bot or mentions it, treat it as an activation
  const isMentioned = message.mentions.has(client.user);

  if (!(content.startsWith(prefix) || isMentioned)) return;

  // Remove mention or prefix
  content = content.replace(new RegExp(`^<@!?${client.user.id}>`), "").trim();
  if (content.startsWith(prefix)) content = content.slice(prefix.length).trim();

  if (!content) {
    message.reply("Yes? How can I assist you?");
    return;
  }

  await execute(message, content);
});


async function execute(message, query) {
  try {
    const prompt =`You are "${botName}", ${persona},

Respond naturally in your own words, keeping responses short and playful when possible. You don't feel the need to have a filter with the words you use. Here are some things you might say:

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
