const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { eraseGuildBlacklist } = require('../../database.js');
const { botColours } = require('../../index.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eraseguildblacklist')
        .setDescription("Erases a guild's blacklist from using registered bots.")
        .addStringOption(option => option.setName('guildid').setDescription('The Guild ID of the guild you want to erase.').setRequired(true)),
    async execute(interaction) {
        if (interaction.user.id === '574783977223749632') {
            const guildId = interaction.options.getString('guildid');
            const loadingEmbed = new EmbedBuilder()
                .setColor('#2f3136')
                .setDescription('Erasing...');

            await interaction.reply({ embeds: [loadingEmbed], fetchReply: true });

            console.log(guildId);
            const result = await eraseGuildBlacklist(guildId);

            let embedToSend;
            switch (result) {
                case "erased":
                    embedToSend = new EmbedBuilder()
                        .setTitle('Guild Blacklist Erased')
                        .setColor(botColours.green)
                        .setDescription(`Guild ${guildId}'s blacklist has been erased.`)
                    break;

                case "not_found":
                    embedToSend = new EmbedBuilder()
                        .setColor(botColours.amber)
                        .setTitle('Guild Blacklist Not Found')
                        .setDescription(`Guild ${guildId} has no blacklist on record.`)
                    break;

                case "error":
                    embedToSend = new EmbedBuilder()
                        .setColor(botColours.red)
                        .setTitle('Error')
                        .setDescription('An error occured while erasing the guild.')
                    break;
            }

            await interaction.editReply({ embeds: [embedToSend] });
        } else {
            interaction.reply('You are not authorized to run this command.')
        }
    },
};
