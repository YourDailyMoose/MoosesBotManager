// main command file
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { blacklistUser } = require('../../database.js');
const { botColours } = require('../../index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Blacklists a user from using the bot.')
    .addUserOption(option => option.setName('user').setDescription('The user you want to blacklist').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for Blacklist').setRequired(true)),

  async execute(interaction) {
    if (interaction.user.id === '574783977223749632') {
      const user = interaction.options.getUser('user');
      const reason = interaction.options.getString('reason');
      const moderator = interaction.user.tag;
      const dateTime = new Date().toLocaleString('en-US', { timeZone: 'Australia/Sydney', hour12: true });
      const userId = user.id;

      const loadingEmbed = new EmbedBuilder()
        .setColor('#2f3136')
        .setDescription('Blacklisting...');

      await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

      const result = await blacklistUser(userId, user.tag, reason, moderator, dateTime);

      let embedToSend;
      switch (result) {
        case "blacklisted":
          embedToSend = new EmbedBuilder()
            .setTitle('Blacklist Successful')
            .setColor(botColours.green)
            .setDescription(`${user.tag} has been blacklisted.`)
            .addFields(
              { name: 'Reason:', value: reason },
              { name: 'Moderator:', value: moderator },
              { name: 'Date & Time:', value: dateTime }
            );

          const blacklistedDMEmbed = new EmbedBuilder() 
            .setColor('#f3786a')
            .setTitle('Blacklisted')
            .setDescription(`You have been blacklisted from using Moose's Assistant. This means you are no longer able to use commands from this bot.`)
            .addFields(
              { name: 'Reason:', value: reason },
              { name: 'Moderator:', value: moderator }
            )
            .setTimestamp();

          try {
            await user.send({ embeds: [blacklistedDMEmbed] });
          } catch (error) {
            console.error('Failed to send DM:', error);
          }
          break;

        case "already_blacklisted":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.amber)
            .setTitle('User Already Blacklisted')
            .setDescription(`${user.tag} is already blacklisted.`)
            .addFields(
              { name: 'Reason:', value: reason },
              { name: 'Moderator:', value: moderator },
              { name: 'Date & Time:', value: dateTime }
            );
          break;

        case "reactivated":
          embedToSend = new EmbedBuilder()
            .setTitle('Blacklist Reactivated')
            .setColor(botColours.green)
            .setDescription(`${user.tag}'s blacklist has been reactivated.`)
            .addFields(
              { name: 'New Reason:', value: reason },
              { name: 'Moderator:', value: moderator },
              { name: 'Date & Time:', value: dateTime }
            );

          const reblacklistedDMEmbed = new EmbedBuilder() 
            .setColor('#f3786a')
            .setTitle('Blacklisted')
            .setDescription(`You have been blacklisted from using Moose's Assistant. This means you are no longer able to use commands from this bot.`)
            .addFields(
              { name: 'Reason:', value: reason },
              { name: 'Moderator:', value: moderator }
            )
            .setTimestamp();

          try {
            await user.send({ embeds: [reblacklistedDMEmbed] });
          } catch (error) {
            console.error('Failed to send DM:', error);
          }
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
