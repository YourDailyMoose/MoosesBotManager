// main command file
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addGuildBlacklist } = require('../../database.js');
const { botColours } = require('../../index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklistguild')
    .setDescription('Blacklists a guild from using registered bots.')
    .addStringOption(option => option.setName('guildid').setDescription('Guild ID').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for Blacklist').setRequired(true)),

  async execute(interaction) {
    if (interaction.user.id === '574783977223749632') {
      const guildId = interaction.options.getString('guildid');
      const reason = interaction.options.getString('reason');
      const moderator = interaction.user.tag;
      const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney', hour12: true });
      

      const loadingEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setDescription('Blacklisting...');

      await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

      const result = await addGuildBlacklist(guildId, reason, moderator, dateTime);

      let embedToSend;
      switch (result) {
        case "blacklisted":
          embedToSend = new EmbedBuilder()
            .setTitle('Guild Blacklist Successful')
            .setColor(botColours.green)
            .setDescription(`Guild ${guildId} has been blacklisted.`)
            .addFields(
              { name: 'Reason:', value: reason },
              { name: 'Moderator:', value: moderator },
              { name: 'Date & Time:', value: dateTime }
            );

          break;

        case "already_blacklisted":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.amber)
            .setTitle('Guild Already Blacklisted')
            .setDescription(`Guild ${guildId} is already blacklisted.`)
          break;

        case "reactivated":
          embedToSend = new EmbedBuilder()
            .setTitle('Blacklist Reactivated')
            .setColor(botColours.green)
            .setDescription(`Guild ${guildId}'s blacklist has been reactivated.`)
            .addFields(
              { name: 'New Reason:', value: reason },
              { name: 'Moderator:', value: moderator },
              { name: 'Date & Time:', value: dateTime }
            );

          break;

        default:
          embedToSend = new EmbedBuilder()
            .setTitle('Error')
            .setColor(botColours.red)
            .setDescription('An error occurred while blacklisting.');
          break;
      }

      await interaction.editReply({ embeds: [embedToSend] });
    } else {
      await interaction.reply('You are not authorized to run this command.');
    }
  }
};