const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Botun ping değerlerini gösterir.'),
    async execute(interaction) {
        try {
            const startTime = Date.now();
            const msg = await interaction.reply({ content: 'Değerler kontrol ediliyor.', ephemeral: false });
            const messagePing = Date.now() - startTime;

            let dbPing = 'Bağlı değil';
            if (mongoose.connection.readyState === 1) { 
                const dbStartTime = Date.now();
                await mongoose.connection.db.admin().ping();
                dbPing = Date.now() - dbStartTime + 'ms';
            }

            const embed = new EmbedBuilder()
                .setColor('Random')
                .setDescription(`
### Discord
- Mesaj Gecikmesi: **${messagePing}ms**
- Websocket Gecikmesi: **${interaction.client.ws.ping}ms**
### Veritabanı
- Veritabanı Gecikmesi: **${dbPing}**`)

            await msg.edit({ content: '', embeds: [embed], ephemeral: false });
        } catch (e) {
            console.error(e);
        }
    },
};
