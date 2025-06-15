const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const Doubt = require('../src/models/Doubt');

module.exports = {
  name: 'ask',
  description: 'Ask a doubt: !ask [TAG] Your question',
  async execute(message, args) {
    const raw = args.join(' ');
    const [, tag, question] = raw.match(/^\[(\w+)\]\s*(.+)/) || [null, '', raw];

    if (!question) {
      return message.reply('❗ Use `!ask [TAG] Your question...`');
    }

    // Save to DB
    const doubt = await Doubt.create({
      userId: message.author.id,
      userName: message.author.tag,
      tag,
      question
    });

    // Build embed
    const embed = new EmbedBuilder()
      .setColor(0xFFCC00)
      .setTitle(`❓ New Doubt ${tag ? `[${tag}]` : ''}`)
      .addFields(
        { name: '👤 Asked by', value: message.author.tag, inline: true },
        { name: '📅 Status', value: '🟡 Open', inline: true },
        { name: '💬 Question', value: question }
      )
      .setFooter({ text: `ID: ${doubt._id}` })
      .setTimestamp();

    // Only Answer button
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`answer_${doubt._id}`)
        .setLabel('💡 Answer')
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({ embeds: [embed], components: [row] });

    // Notify mentors
    const mentorRole = message.guild.roles.cache.get(process.env.MENTOR_ROLE_ID);
    if (mentorRole) {
      await message.channel.send(`${mentorRole}`);
    }
  }
};
