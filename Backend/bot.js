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
const { InteractionResponseFlags } = require('discord-api-types/v10');

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY, // from .env
  // defaultHeaders: {
  //   'HTTP-Referer': 'https://yourproject.com', // Change to your website/GitHub
  //   'X-Title': 'Algopath Discord Bot'
  // }
});


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



client.on('messageCreate', async (message) => {
  // Ignore bots
  if (message.author.bot) return;

  // Only respond in specific AI channel
  if (message.channel.id !== process.env.AI_CHAT_CHANNEL_ID) {   
    return;  
    //  return message.reply(`❌ This command can only be used in AI_CHATBOT CHANNEL}>`);
}

  try {
    const prompt = message.content;

      const completion = await openai.chat.completions.create({
      model: "mistralai/mistral-7b-instruct", // ✅ Free model on OpenRouter
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
// In your interactionCreate listener
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;
  const [action, id] = interaction.customId.split('_');
  if (action !== 'answer') return;

  const doubt = await Doubt.findById(id);
  if (!doubt) {
    return interaction.reply('❌ This doubt no longer exists.');
  }

  // Block asker from answering
  if (interaction.user.id === doubt.userId) {
    return interaction.reply('🚫 You cannot answer your own doubt.');
  }

  // Only mentors may answer
  if (!interaction.member.roles.cache.has(process.env.MENTOR_ROLE_ID)) {
    return interaction.reply('🚫 Only mentors can submit solutions.');
  }

  // Prevent the same mentor answering twice
  if (doubt.solutions.some(s => s.userId === interaction.user.id)) {
    return interaction.reply('❌ You have already submitted a solution for this doubt.');
  }

  // Prompt for the solution
  await interaction.reply('✍️ Please type your solution below (you have 60s):');

  const filter = m => m.author.id === interaction.user.id;
  const collector = interaction.channel.createMessageCollector({ filter, max: 1, time: 60000 });

  collector.on('collect', async msg => {
    // Save the solution
    doubt.solutions.push({
      userId: msg.author.id,
      userName: msg.author.tag,
      content: msg.content,
      createdAt: new Date()
    });

    // Auto-resolve on first answer
    if (doubt.status === 'Open') {
      doubt.status = 'Resolved';
      doubt.resolvedBy = msg.author.id;
      doubt.firstAnswerBy = msg.author.id;
    }

    await doubt.save();

    // Update the embed: status + append this solution
    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .spliceFields(1, 1, {
        name: '📅 Status',
        value: doubt.status === 'Resolved' ? '✅ Resolved' : '🟡 Open',
        inline: true
      })
      .addFields({
        name: `🧠 Solution by ${msg.author.tag}`,
        value: msg.content.slice(0, 1024)
      })
      .setColor(doubt.status === 'Resolved' ? 0x00CC66 : 0xFFCC00);

    // Edit message (button stays active)
    await interaction.message.edit({ embeds: [updatedEmbed] });

    // React for community voting
    msg.react('👍');
    msg.react('👎');

    interaction.followUp('✅ Solution added!');
  });
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
