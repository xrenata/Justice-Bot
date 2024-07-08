const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const os = require('os');
const { version: nodeVersion } = require('discord.js');
const Story = require('../models/Story');
const User = require('../models/User');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('istatistik')
        .setDescription('Bot istatistiklerini gösterir.'),
    async execute(interaction) {
        try {
            const usersCount = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
            const serversCount = interaction.client.guilds.cache.size;


            const embed = new EmbedBuilder()
                .setColor('Random')
                .setAuthor({name:`${interaction.client.user.username}`, iconURL:interaction.client.user.avatarURL()})
                .setDescription(`
### Sistem                    
- Platform: **${os.platform()}** 
- Arch: **${os.arch()}**
- Bellek
 - Toplam: **${formatBit(os.totalmem())}**
 - Boş: **${formatBit(os.freemem())}**
### CPU
 - Model: **${os.cpus()[0].model}**
 - Uptime: **${formatUptime(interaction.client.uptime)}**
### Bot
 - Node.js: **${process.version}**
 - Discord.js: **${nodeVersion}**
 - Uptime: **${formatUptime(process.uptime())}** 
 - Sunucular: **${serversCount}**
 - Kullanıcılar: **${usersCount}**
### Veritabanı
 - Hikaye Sayısı: **${await Story.countDocuments()}**
 - Kullanıcı Sayısı: **${await User.countDocuments()}**
         `)
            await interaction.reply({ embeds: [embed], ephemeral: false });
        } catch (e) {
            console.error(e);
        }
    },
};

function formatBit(bytes) {
    if (bytes === 0) return '0 Byte';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
    const m = Math.floor(seconds / (3600 * 24 * 30));
    const d = Math.floor((seconds % (3600 * 24 * 30)) / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const min = Math.floor((seconds % 3600) / 60);
    
    let uptime = '';
    if (m > 0) uptime += `${m} ay, `;
    if (m > 0 || d > 0) uptime += `${d} gün, `;
    if (m > 0 || d > 0 || h > 0) uptime += `${h} saat, `;
    uptime += `${min} dakika`;
    
    return uptime;
}