// const Doubt = require('../src/models/Doubt');
// const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// module.exports = {
//   name: 'ask',
//   description: 'Ask a doubt',
//   async execute(message, args) {
//     if (message.channel.id !== process.env.DOUBT_CHANNEL_ID) {
//       return message.reply("❌ Please ask doubts only in <#"+process.env.DOUBT_CHANNEL_ID+">");
//     }

//     const splitIndex = args.findIndex(arg => arg === '|');
//     if (splitIndex === -1) {
//       return message.reply("Format: `!ask topic | doubt details`");
//     }

//     const topic = args.slice(0, splitIndex).join(' ');
//     const description = args.slice(splitIndex + 1).join(' ');

//     const newDoubt = await new Doubt({
//       userId: message.author.id,
//       username: message.author.tag,
//       topic,
//       description
//     }).save();

//     const embed = new EmbedBuilder()
//       .setColor(0xffcc00)
//       .setTitle("📝 New Doubt Submitted")
//       .addFields(
//         { name: "👤 User", value: `<@${message.author.id}>`, inline: false },
//         { name: "📌 Topic", value: topic, inline: false },
//         { name: "❓ Doubt", value: description, inline: false },
//         { name: "📅 Status", value: "Pending", inline: true }
//       )
//       .setFooter({ text: `ID: ${newDoubt._id}` })
//       .setTimestamp();

//     const button = new ButtonBuilder()
//       .setCustomId(`resolve_${newDoubt._id}`)
//       .setLabel("✅ Resolve")
//       .setStyle(ButtonStyle.Success);

//     const row = new ActionRowBuilder().addComponents(button);

//     await message.channel.send({
//       content: `<@&${process.env.MENTOR_ROLE_ID}>`,
//       embeds: [embed],
//       components: [row]
//     });

//     message.reply("✅ Your doubt has been submitted!");
//   }
// };
const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const Doubt = require('../src/models/Doubt');

module.exports = {
  name: 'ask',
  description: 'Ask a doubt',
  async execute(message, args) {
    if (message.channel.id !== process.env.DOUBT_CHANNEL_ID) {
      return message.reply(`❌ Please ask doubts only in <#${process.env.DOUBT_CHANNEL_ID}>`);
    }

    const splitIndex = args.findIndex(arg => arg === '|');
    if (splitIndex === -1 || args.length <= splitIndex + 1) {
      return message.reply("❌ Incorrect format. Use: `!ask topic | doubt details`");
    }

    const topic = args.slice(0, splitIndex).join(' ').trim();
    const description = args.slice(splitIndex + 1).join(' ').trim();

    if (!topic || !description) {
      return message.reply("❌ Both topic and doubt details are required.");
    }

    const doubt = await new Doubt({
      userId: message.author.id,
      username: message.author.tag,
      topic,
      description
    }).save();

    const embed = new EmbedBuilder()
      .setColor(0xffcc00)
      .setTitle("📝 New Doubt Submitted")
      .addFields(
        { name: "👤 User", value: `<@${message.author.id}>`, inline: false },
        { name: "📌 Topic", value: topic, inline: false },
        { name: "❓ Doubt", value: description, inline: false },
        { name: "📅 Status", value: "Pending", inline: true },
        { name: "🆔 Doubt ID", value: doubt._id.toString(), inline: true }
      )
      .setFooter({ text: `Asked by ${message.author.tag}` })
      .setTimestamp();

    const button = new ButtonBuilder()
      .setCustomId(`resolve_${doubt._id}`)
      .setLabel("✅ Resolve")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({
      content: `<@&${process.env.MENTOR_ROLE_ID}>`,
      embeds: [embed],
      components: [row]
    });

    await message.reply(`✅ Your doubt has been submitted! (ID: \`${doubt._id}\`)`);
  }
};
