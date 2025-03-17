const { EmbedBuilder } = require('@discordjs/builders');

// Define the help function
function help(message) {
  const embed = new EmbedBuilder()
    .setTitle("Sup! Here's how you talk to me!")
    .setDescription("I'm first and foremost an AI, so I don't have much to offer!")
    .addFields(
      { name: 'Syntax:', value: '`kar> <message>`' }
    )
    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

  message.reply({ embeds: [embed] });
}

// Export the help function
module.exports = {
  name: 'help', // Command name
  description: 'Displays help information about the bot.', // Command description
  execute: help, // Function to execute when the command is called
};