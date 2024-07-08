const { ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const User = require('../models/User');
const Story = require('../models/Story');
module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Hakim Bilgisi')
        .setType(ApplicationCommandType.User),
    async execute(interaction) {
        const userId = interaction.targetId;
        try {
            const user = await User.findOne({ userId }).populate('playedStories');
            if (!user) {
                await interaction.reply({ content: 'Henüz bi hikayeye başlamamışınız.', ephemeral: true });
                return;
            }

            await interaction.reply({ content: `
**Profil:**
- Toplam Oynanan Hikaye: ${user.playedStories.length}
- Doğru Tamamlanan Hikaye: ${user.correctStories}
            `, ephemeral: false });
        } catch (e) {
            console.error(e);
        }
    }
}