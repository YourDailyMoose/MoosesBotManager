const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBlacklistedUsers } = require('../../database.js');  // Import your database function
const { botColours } = require('../../index.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('listblacklists')
    .setDescription('Lists all blacklisted users.'),
  async execute(interaction) {
    if (interaction.user.id === '574783977223749632') {
      const loadingEmbed = new EmbedBuilder()
        .setColor(botColours.gray)
        .setDescription('Fetching Blacklist Data...');

      await interaction.reply({ embeds: [loadingEmbed] });

      // Fetch blacklisted users from the database
      let blacklistData;
      try {
        blacklistData = await getBlacklistedUsers();  // Fetch from the database
      } catch (error) {
        console.error('Error loading blacklist data:', error);
        return interaction.editReply({ content: 'An error occurred while fetching blacklist data.' });
      }

      if (!blacklistData || blacklistData.length === 0) {
        const noBlacklistedUsers = new EmbedBuilder()
          .setColor(botColours.primary)
          .setDescription('There are no blacklisted users.');

        return interaction.editReply({ embeds: [noBlacklistedUsers] });
      }

      const blacklistEmbed = new EmbedBuilder()
        .setColor(botColours.primary)
        .setTitle('Blacklists')
        .addFields(
          ...blacklistData.map(entry => ({
            name: `${entry.UserTag} (${entry.UserId})`,
            value: `**Reason:** ${entry.Reason}\n**Moderator:** ${entry.Moderator}\n**Date/Time:** ${entry.DateTime}\n**Active:** ${entry.Active ? 'Yes' : 'No'}`,
            inline: false
          }))
        );

      return interaction.editReply({ embeds: [blacklistEmbed] });
    } else {
      interaction.reply('You are not authorized to run this command.');
    }
  }
};
