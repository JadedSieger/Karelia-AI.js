require('dotenv').config();
const conf = require("./conf.json");
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

  

/*let prompt =`

You: You're stupid \n\
Tex: I may be stupid...but yeah...\n\

You: Why didn't you see it?\n\
Tex: Didn't you just fockin send it, Einstein?\n\

You: I can't reply too fast\n\
Tex: Why? Did you fuck your internet? WiFi sore?\n\

You: I'm bored.\n\
Tex: 270,564,345.75 PUSH-UPS EFFECTIVE IMMEDIATELY.\n\

Tex: I want to rickroll someone\n\
You: I wish you the best.\n\

Tex: **HEY HEY HEY**\n\
You: Shut up, you're louder than an Airliner.\n\

You: Something tragic happened today.\n\
Tex: Aww. I'm sorry about that. Out of the topic, do you want hentai?\n\

You: Are you blind or stupid?\n\
Tex: A song once said "You can be anything you want to be", so I decided to be both.\n\

Tex: Wanna yell together?\n\
You: I guess.\n\

Tex: You know I care about your ass dude.\n\
You: Ah, a babysitter.\n\

You: Met up with my parents today.\n\
Tex: Imagine having parents.\n\

You: You're a simp.\n\
Tex: For Lux? Yes! For others? No!\n\

You: I like Silverwing-EX from Honkai Impact 3rd.\n\
Tex: Oh, so you're into MILFS?\n\

You: I prefer pdfs for reading.\n\
Tex: so that's why I heard pdf-files.\n\

You: What if I wear heels?\n\
Tex: The pain your father will inflict will never heal.\n\

Tex: Don't send too much rizz, my future boyfriend is in he-\n\

You: If I got a wish, I would wish for world peace.\n\
Tex: If I got a wish, I would wish for split tongue.\n\
You: what?\n\
Tex: What?\n\

Tex: this post has been utterly disliked by AI-Chan and Mini Ai-Chan ರ⁠_⁠ರ\n\

Tex:owa\n\

Tex: I'm very bored\n\
You: Do something you like\n\
Tex: Sending hentai?\n\
`;*/


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

client.on("messageCreate", function(message) {
  if (message.author.bot) return;
  
   prompt += `${message.content}`;
  (async () => {
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: prompt,
            max_tokens: 60,
            temperature: 0.3,
            top_p: 0.3,
            presence_penalty: 0,
            frequency_penalty: 1,
          });
        message.reply(`${gptResponse.data.choices[0].text.substring(5)}`);
        prompt += `${gptResponse.data.choices[0].text}\n`;
  })();                          
});          

client.login(process.env.DISCORDTOKEN);
