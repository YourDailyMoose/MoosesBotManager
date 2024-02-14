const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { unBlacklistGuild } = require('../../database.js');
const { botColours } = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unblacklistguild')
        .setDescription("Unblacklists a guild from using registered bots.")
        .addStringOption(option => option.setName('guildid').setDescription('The Guild ID of the guild you want to unblacklist.').setRequired(true)),
    async execute(interaction) {    
        if (interaction.user.id === '574783977223749632') {
            const guildId = interaction.options.getString('guildid');
            const loadingEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setDescription('Unblacklisting...');
            
            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

        
            const result = await unBlacklistGuild(guildId);

            let embedToSend;
            switch (result) {
                case "unblacklisted":
                    embedToSend = new EmbedBuilder()
                        .setTitle('Unblacklist Successful')
                        .setColor(botColours.green)
                        .setDescription(`Guild ${guildId} has been unblacklisted.`)
                    break;

                case "not_blacklisted":
                    embedToSend = new EmbedBuilder()
                        .setColor(botColours.amber)
                        .setTitle('Guild Not Blacklisted')
                        .setDescription(`Guild ${guildId} is not blacklisted.`)
                    break;

                case "error":
                    embedToSend = new EmbedBuilder()
                        .setColor(botColours.red)
                        .setTitle('Error')
                        .setDescription('An error occured while unblacklisting the guild.')
                    break;
            }
           
            await interaction.editReply({ embeds: [embedToSend] });
        } else {
            interaction.reply('You are not authorized to run this command.')
        }
    },
};
