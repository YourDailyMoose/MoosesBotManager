const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { unblacklistUser } = require('../../database.js');
const { botColours } = require('../../index.js');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unblacklist')
    .setDescription("Deactivates a user's blacklist status. [DEV ONLY]")
    .addUserOption(option => option.setName('user').setDescription('The user you want to deactivate blacklist status for').setRequired(true)),
  async execute(interaction) {
    if (interaction.user.id === '574783977223749632') {
      const user = interaction.options.getUser('user');
      const userId = user.id;

      const loadingEmbed = new EmbedBuilder()
        .setColor(botColours.gray)
        .setDescription('Unblacklisting...');

      await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

      const result = await unblacklistUser(userId);

      let embedToSend;

      switch (result) {
        case "unblacklisted":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.green)
            .setTitle('Unblacklist Successful')
            .setDescription(`Blacklist status for \`${user.tag}\` has been deactivated.`)
          break;

        case "not_blacklisted":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.red)
            .setTitle('User Not Blacklisted')
            .setDescription(`\`${user.tag}\` is not blacklisted.`)
          break;

        case "error":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.red)
            .setTitle('Error')
            .setDescription('An error occured while unblacklisting the user.')
          break;
      }

      await interaction.editReply({ embeds: [embedToSend] });
      
    } else {
      interaction.reply('You are not authorized to run this command.')
    }
  },
};
