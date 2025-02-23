require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
   intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const genAI = new GoogleGenerativeAI(process.env.g_apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const result = await model.generateContent(query);
    const response = result.response.text();
    message.reply(response);
  } catch (error) {
    console.error("Error generating response:", error);
    message.reply("Sorry, I encountered an error while generating a response.");
  }
}

client.login(process.env.bot_token);
