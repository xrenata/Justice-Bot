const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const User = require('../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coin')
        .setDescription('Coin görevlerini görüntüler ve tamamlar.'),
    async execute(interaction) {
        const userId = interaction.user.id;
            let user = await User.findOne({ userId });
            if (!user) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('accept_terms')
                            .setEmoji('1237629441711144970')
                            .setStyle('Secondary')
                    );

                const rep = await interaction.reply({
                    embeds: [new EmbedBuilder().setDescription(`
### Kullanım Şartları
1. Botun sunduğu hizmetlerin kullanımı, Discord'un Kullanım Şartları ve Topluluk Kurallarına uygun olmalıdır. 
2. Botun sunucunuza eklendiği durumda, botun yönetici izinlerine sahip olması önerilir. Ancak, gerekli izinlerin dışında ekstra izinler vermek veya gereksiz izinleri talep etmek güvenlik riski oluşturabilir.
3. Botun kötüye kullanımı yasaktır. Botun bir hata veya açık bulundurduğunu düşünüyorsanız, lütfen geliştiriciye bildirin.
4. Botun kullanımı sırasında oluşabilecek veri kaybı veya diğer olumsuz durumlar için geliştirici sorumlu tutulamaz.
5. Geliştirici, botun özelliklerini ve kullanımını değiştirme hakkını saklı tutar.
6. Botun kullanımı ile ilgili herhangi bir sorunuz veya geri bildiriminiz varsa, lütfen geliştirici ile iletişime geçin.
                    `)],
                    components: [row],
                    ephemeral: true
                });

                const filter = i => i.customId === 'accept_terms' && i.user.id === userId;
                const collector = rep.createMessageComponentCollector({ filter, time: 35000 });

                collector.on('collect', async i => {
                    collector.stop(); 
                    await i.deferUpdate(); 

                    user = await User.create({ userId, coins: 2, supportServerJoined: false, botAdded: false }); 
                    await interaction.editReply({ components: [], embeds: [new EmbedBuilder().setDescription('Şartları onayladınız, botu kullanabilirsiniz.')] });
                });

                collector.on('end', collected => {
                    if (collected.size === 0) {
                        interaction.editReply({ components: [], embeds: [new EmbedBuilder().setDescription('Belirtilen süre içinde şartları kabul etmediniz.')] });
                    }
                });

                return; 
            }

            const supportServerJoined = user.supportServerJoined;
            const botOwner = user.botOwner;

            const tasks = [];
            if (!supportServerJoined) {
                tasks.push({
                    name: 'Destek Sunucusuna Katıl',
                    coins: 5,
                    completed: false,
                    description: 'Destek sunucumuza katılın ve 5 coin kazanın.',
                    link: 'https://discord.gg/disbot'
                });
            }
            if (!botOwner) {
                tasks.push({
                    name: 'Botu Sunucunuza Ekleyin',
                    coins: 5,
                    completed: false,
                    description: 'Botu sunucunuza ekleyin ve 5 coin kazanın.'
                });
            }

            if (tasks.length === 0) {
                await interaction.reply({ content: 'Tamamlanacak görev bulunamadı.', ephemeral: true });
                return;
            }

            const replyContent = tasks.map(task => {
                return `
**${task.name}**
- Durum: ${task.completed ? 'Tamamlandı' : 'Tamamlanmadı'}
- Açıklama: ${task.description}
${task.link ? `- [Destek Sunucu Linki](${task.link})` : ''}
                `;
            }).join('\n');

            await interaction.reply({ content: replyContent, ephemeral: true });

            if (!supportServerJoined) {
                const filter = i => i.user.id === userId && i.customId === 'join_support_server';
                const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

                collector.on('collect', async i => {
                    await i.deferUpdate();

                    user.coins += 5;
                    user.supportServerJoined = true;
                    await user.save();

                    await interaction.editReply({
                        content: '',
                        components: [],
                        ephemeral: true
                    });
                });
            }

            if (!botOwner) {
                const guilds = await interaction.client.guilds.fetch();
                const x = guilds.map(guild => guild.ownerId);

                if (x.includes(interaction.member.id)) {
                    user.botOwner = true;
                    user.coins += 5;
                    await user.save();
                }
            }
    },
};
