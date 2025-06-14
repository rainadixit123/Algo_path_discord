require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Collection,
  Partials,
  Events,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const Doubt=require('./src/models/Doubt')
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');



const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
  ],
});


client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}


client.once('ready', () => {
  console.log('🤖 Bot is online');
});

client.on(Events.GuildMemberAdd, async (member) => {
   console.log("👋 New member joined:", member.user.tag);

 const role = member.guild.roles.cache.get(process.env.VERIFIED_ROLE_ID);

  try{
    await member.roles.add(role);
     console.log(`Assigned Verified role to ${member.user.tag}`);
 }
 catch(err){
      console.error("❌ Could not assign role:", err.message);
 }

  try {
    await member.send(`👋 Welcome to Algopath, ${member.user.username}! Ask doubts in #doubts.`);
  } catch {
    console.log("Could not DM member.");
  }
});


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only respond in specific AI channel
  if (message.channel.id !== process.env.AI_CHAT_CHANNEL_ID) {     
     return message.reply(`❌ This command can only be used in AI_CHATBOT CHANNEL}>`);
}

  try {
    const prompt = message.content;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
    });

    const response = completion.choices[0].message.content;

    const embed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle("🤖 Gemi AI")
      .setDescription(response.slice(0, 4000))
      .setFooter({ text: `Prompt by ${message.author.tag}` })
      .setTimestamp();

    await message.channel.send({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    await message.reply("❌ Gemi failed to respond.");
  }
});


// Handle !commands
client.on('messageCreate', async message => {
    console.log(`[DEBUG] Message received: ${message.content}`);

  if (!message.content.startsWith('!') || message.author.bot) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);

  if (command) {
    try {
      await command.execute(message, args);
    } catch (err) {
      console.error(err);
      message.reply("⚠️ Error executing command.");
    }
  }
});


// Handle Button Interactions
client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const [action, doubtId] = interaction.customId.split('_');

  if (action === 'resolve') {
    if (!interaction.member.roles.cache.has(process.env.MENTOR_ROLE_ID)) {
      return interaction.reply({ content: "🚫 Only mentors can resolve doubts.", ephemeral: true });
    }

    const doubt = await Doubt.findById(doubtId);
    if (!doubt || doubt.status === 'Resolved') {
      return interaction.reply({ content: "❌ Doubt not found or already resolved.", ephemeral: true });
    }

    doubt.status = 'Resolved';
    await doubt.save();

    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .spliceFields(3, 1, { name: "📅 Status", value: "✅ Resolved", inline: true })
      .setColor(0x00cc66);

    const disabledButton = new ButtonBuilder()
      .setCustomId(`resolve_${doubtId}`)
      .setLabel("✅ Resolved")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true);

    const row = new ActionRowBuilder().addComponents(disabledButton);

    await interaction.update({ embeds: [updatedEmbed], components: [row] });
  }
});


async function generateOneTimeInvite(channelId) {
  const channel = await client.channels.fetch(channelId);
  const invite = await channel.createInvite({
    maxUses: 1,
    maxAge: 30,
    unique: true,
  });

  return invite.url;
}




// module.exports = { client, assignVerifiedRole,generateOneTimeInvite };
module.exports = { client,generateOneTimeInvite };
