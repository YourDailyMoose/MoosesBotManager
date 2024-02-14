
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, InteractionType, EmbedBuilder, Intents, ActionRowBuilder, ButtonStyle, ButtonBuilder, GatewayOpcodes, WebhookClient, ActivityType } = require('discord.js');
const { DateTime } = require('luxon');
const { connectDatabase, isUserBlacklisted } = require('./database');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });

client.cooldowns = new Collection();
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');

const botColours = {
  primary: '#61c2ff',
  green: '#bcf7cb',
  gray: '#2f3136',
  red: '#f6786a',
  amber: '#f8c57c',
  purple: '#966FD6'
};

module.exports.botColours = botColours;

const notAuthorizedEmbed = new EmbedBuilder()
  .setColor(botColours.red)
  .setTitle('Error')
  .setDescription('You are not authorized to run this command.')

module.exports.notAuthorizedEmbed = notAuthorizedEmbed;


connectDatabase(process.env.MONGOURI).then(() => {
  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Failed to connect to MongoDB", err);
});

async function loadCommands() {
  const commandFolders = await fs.promises.readdir(foldersPath);

  for (const folder of commandFolders) {
    const folderPath = path.join(foldersPath, folder);
    const isDirectory = (await fs.promises.stat(folderPath)).isDirectory();

    if (isDirectory) {
      const commandFiles = await fs.promises.readdir(folderPath);
      for (const file of commandFiles) {
        if (file.endsWith('.js') && !file.startsWith('.')) {
          const filePath = path.join(folderPath, file);
          const command = require(filePath);

          if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
          } else {
            console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
          }
        }
      }
    }
  }
}


client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
    } else {
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  }

});


client.on('guildMemberAdd', async (member) => {
  const guildId = '736727136618020868';
  const roleId = '1202129776081645568';

  if (member.guild.id === guildId) {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
      try {
        await member.roles.add(role);
        console.log(`Added role ${role.name} to ${member.user.tag}`);
      } catch (error) {
        console.error(`Error adding role to ${member.user.tag}:`, error);
      }
    } else {
      console.error(`Role with ID ${roleId} not found.`);
    }
  }
});


client.once('ready', () => {

  const status = client.user.setActivity({
    type: ActivityType.Custom,
    name: 'customstatus',
    state: 'Hi! I\'m Moose\'s Bot Manager!!',
  });

  console.log(`
  
  ╔════════════════════════════╗
  ║   Moose's Bot Management   ║
  ╚════════════════════════════╝
  ✅ Logged in as ${client.user.tag} (${client.user.id})
  ✅ Presence: 🟢 Online
  ✅ Commands loaded: ${client.commands.size}
  
  `);

});


(async () => {

  await loadCommands();

  await client.login(process.env.TOKEN);
})();
