const Doubt = require('../src/models/Doubt');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'stats',
  description: 'Show statistics about doubts',
  async execute(message) {
    const total = await Doubt.countDocuments();
    const resolved = await Doubt.countDocuments({ status: 'Resolved' });

    const resolverStats = await Doubt.aggregate([
  { $match: { status: 'Resolved' } },
  { $group: { _id: '$resolvedBy', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
]);

const answererStats = await Doubt.aggregate([
  { $match: { firstAnswerBy: { $exists: true } } },
  { $group: { _id: '$firstAnswerBy', count: { $sum: 1 } } },
  { $sort: { count: -1 } },
  { $limit: 5 }
]);

const topResolver = resolverStats[0];
const topAnswerer = answererStats[0];
    const leaderboard = resolverStats.map((r, i) =>
      `**#${i + 1}** <@${r._id}> — ${r.count} resolved`
    ).join('\n');

    const embed = new EmbedBuilder()
  .setTitle('📊 Doubt Statistics')
  .setColor(0x3498db)
  .addFields(
    { name: 'Total Doubts Asked', value: `${total}`, inline: true },
    { name: 'Total Resolved', value: `${resolved}`, inline: true },
    topResolver
      ? { name: '🏆 Top Resolver', value: `<@${topResolver._id}> (${topResolver.count} resolved)` }
      : { name: '🏆 Top Resolver', value: 'No one yet!' },
    topAnswerer
      ? { name: '💡 Top Contributor', value: `<@${topAnswerer._id}> (${topAnswerer.count} answers)` }
      : { name: '💡 Top Contributor', value: 'No one yet!' },
    {
      name: '📈 Resolvers Leaderboard',
      value: resolverStats.map((r, i) => `**#${i + 1}** <@${r._id}> — ${r.count} resolved`).join('\n') || 'No resolved doubts yet.'
    }
  )
  .setTimestamp();
    message.channel.send({ embeds: [embed] });
  }
};
