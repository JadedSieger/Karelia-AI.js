// events/guildMemberAdd.js
const { EmbedBuilder } = require('@discordjs/builders');

module.exports = (client) => {
  const welcomeChannelId = process.env.welcomeChannelId; // Get the welcome channel ID from .env

  client.on('guildMemberAdd', async (member) => {
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);

    if (welcomeChannel) {
      const embed = new EmbedBuilder()
        .setTitle(`Welcome to The Dugout, ${member.user.tag}!`)
        .setDescription('On behalf of the staff and the members, we hope you have a nice stay!')
        .setFooter({ text: 'The Dugout', iconURL: member.guild.iconURL() }) // Use server name and icon
        .setColor(0x00FF00) // Set a color for the embed
        .setThumbnail(member.user.displayAvatarURL()); // Add the user's avatar as a thumbnail

      welcomeChannel.send({ embeds: [embed] });
    } else {
      console.error('Welcome channel not found!');
    }
  });
};