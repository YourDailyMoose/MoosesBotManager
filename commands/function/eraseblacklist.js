const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { eraseBlacklist } = require('../../database.js');
const { botColours } = require('../../index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('eraseblacklist')
    .setDescription("Deletes a user's blacklist record.")
    .addUserOption(option => option.setName('user').setDescription('The user you want to delete the blacklist record for').setRequired(true)),
    
  async execute(interaction) {
    if (interaction.user.id === '574783977223749632') {

      const loadingEmbed = new EmbedBuilder()
        .setColor(botColours.gray)
        .setDescription('Erasing Blacklist...')
      
      const user = interaction.options.getUser('user');
      const userId = user.id;

      await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

      const result = await eraseBlacklist(userId);

      let embedToSend;

      switch (result) {
        case "erased":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.green)
            .setTitle('Blacklist Erased')
            .setDescription(`Blacklist record for \`${user.tag}\` has been erased.`)
          break;

        case "not_found":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.red)
            .setTitle('Blacklist Not Found')
            .setDescription(`Blacklist record for \`${user.tag}\` not found.`)
          break;

        case "error":
          embedToSend = new EmbedBuilder()
            .setColor(botColours.red)
            .setTitle('Error')
            .setDescription('An error occured while erasing the blacklist.')
          break;
      }

      await interaction.editReply({ embeds: [embedToSend] });

    } else {
      interaction.reply('You are not authorized to run this command.')
    }
  },
};
