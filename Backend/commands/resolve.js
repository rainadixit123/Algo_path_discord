const Doubt = require('../src/models/Doubt');

module.exports = {
  name: 'resolve',
  description: 'Mark a doubt as resolved',
  async execute(message, args) {
    // if (!message.member.roles.cache.has(process.env.MENTOR_ROLE_ID)) {
    //   return message.reply("🚫 Only mentors can resolve doubts.");
    // }

    const id = args[0];
    const doubt = await Doubt.findById(id);

    if (!doubt) return message.reply("❌ Doubt not found.");

    doubt.status = "Resolved";
    await doubt.save();

    message.reply(`✅ Doubt **${id}** marked as resolved.`);
  }
};