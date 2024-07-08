const { SlashCommandBuilder } = require('discord.js');
const User = require('../models/User');
const Story = require('../models/Story');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('Profilinizi görüntüler.'),
    async execute(interaction) {
        const userId = interaction.user.id;

        try {
            const user = await User.findOne({ userId });

            if (!user) {
                await interaction.reply({ content: 'Henüz bir hikayeye başlamamışsınız.', ephemeral: true });
                return;
            }

            const totalPlayed = user.playedStories.length;
            const totalCorrect = user.correctStories;
            const coins = user.coins; 

            const profileEmbed = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`
- Toplam Oynanan Hikaye: **${totalPlayed}**
- Doğru Tamamlanan Hikaye: **${totalCorrect}**
- Coin Sayınız: **${coins}**`)
                .setFooter({text:"Coin yenilemek için /coin komutunu kullanın."})

            await interaction.reply({ embeds: [profileEmbed], ephemeral: false });
        } catch (e) {
            console.error(e);
        }
    },
};
