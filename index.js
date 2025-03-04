require('dotenv').config();
const fs = require('fs');
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { EmbedBuilder } = require('@discordjs/builders');
const filters = require('./filters.json');
const { log } = require('console');
const path = require('path');
const { zrffntrUnaqyre } = require('./decFunc.js');

const client = new Client({
   intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", ()=>  {
  console.log("Karelia-AI-v2.0.0 online");
  client.user.setActivity(
    "PIERDOLE, KURWA BOBER BLYAT", 
    {
      type: ActivityType.Streaming
    })
});

const genAI = new GoogleGenerativeAI(process.env.g_apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash",
  safetySettings:[
    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ]
 });

const personalityData = JSON.parse(fs.readFileSync("personality.json","utf8"));
const botName = personalityData.name || "Karelia";
const persona = personalityData.persona;
const bannedPhraseWords = filters.banned_phrases_words.map(word => word.toLowerCase());

const formattedExamples = personalityData.examples
.map(conv =>conv.user ? `user: ${conv.user}\n${botName}: ${conv.bot}`: `${botName}: ${conv.bot}`).join("\n\n");


// Prefix can be either the defined prefix (e.g., "!") or the bot mention
const prefix = process.env.prefix || process.env.prefix2 || `<@${process.env.bot_ID}>`;

client.on("messageCreate", async function (message) {
  if (message.author.bot) return;

  let content = message.content.trim();
  zrffntrUnaqyre(message);
  // If the message is a reply to the bot or mentions it, treat it as an activation
  const isMentioned = message.mentions.has(client.user);

  if (!(content.startsWith(prefix) || isMentioned)) return;

  // Remove mention or prefix
  if (isMentioned)content = content.replaceAll(new RegExp(`^<@!?${client.user.id}>`), "").trim();
  if (content.startsWith(prefix)) content = content.slice(prefix.length).trim();

  if (!content) {
    message.reply("Yes? How can I assist you?");
    return;
  }

  if(bannedPhraseWords.some(word => content.toLowerCase().includes(word))){
    await message.delete();
    message.channel.send(`${message.author}, your message contained prohibited words or phrases and was removed.`).then(msg =>{
      setTimeout(() => msg.delete(), 5000);
    });
    zrffntrUnaqyre(message);
    return;
  }

  let helpRes;

  if(content.toLowerCase() === "help"){
    return help(message);
  }
  console.log(`[User: ${message.author.tag}] -> ${content}`);
  await execute(message, content);

  console.log(message);
});


async function execute(message, query) {
  try {
    const prompt =`You are "${botName}", a ${persona} Respond naturally in your own words, keeping responses short and playful when possible. don't have a filter with the words you use. Here are some things you might say:

"${formattedExamples}"

Now, respond to this input in your own way, without repeating the format above:

"${query}"`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    if (!response) {
      message.reply("⚠️ Sorry, I can't respond to that.");
      zrffntrUnaqyre(message); // Log the blocked message
      return;
    }
    
    const cleanResponse = response.replace(/^.*?:/,"").trim();
    message.reply(cleanResponse);
    console.log(cleanResponse);
  } catch (error) {
    console.error("Error generating response:", error);
    message.reply("Sorry, I encountered an error while generating a response.");
  }
}

function help(message){
  
    const embed = new EmbedBuilder()
    .setTitle("Sup! Here's how you talk to me!")
    .setDescription("I'm first and foremost an AI, so I don't have much to offer!")
    .addFields(
      { name: 'Syntax:', value: '`kar> <message>`'}
    )
    .setFooter({ text: `Requested by ${message.author.tag}`,iconURL: message.author.displayAvatarURL()})
  
    message.reply({embeds: [embed]});
  }

client.login(process.env.bot_token);
