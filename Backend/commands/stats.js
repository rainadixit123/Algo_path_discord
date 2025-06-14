// const Doubt = require('../src/models/Doubt');

// module.exports = {
//   name: 'stats',
//   description: 'Show how many doubts a user has asked',
//   async execute(message) {
//     const count = await Doubt.countDocuments({ userId: message.author.id });
//     message.reply(`📊 You have asked **${count}** doubts so far.`);
//   }
// };
const Doubt = require('../src/models/Doubt');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Show doubt statistics',
  async execute(message) {
    const total = await Doubt.countDocuments({});
    const resolved = await Doubt.countDocuments({ status: 'Resolved' });
    const pending = total - resolved;

    const topUsers = await Doubt.aggregate([
      { $group: { _id: '$username', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    const topContributors = topUsers.map((u, i) => `**${i + 1}.** ${u._id} — ${u.count} doubts`).join('\n') || 'No data yet.';

    const embed = new EmbedBuilder()
      .setColor(0x3399ff)
      .setTitle('📊 Doubt Stats')
      .addFields(
        { name: '📌 Total Doubts', value: total.toString(), inline: true },
        { name: '✅ Resolved', value: resolved.toString(), inline: true },
        { name: '🕒 Pending', value: pending.toString(), inline: true },
        { name: '🏆 Top Contributors', value: topContributors, inline: false }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};

