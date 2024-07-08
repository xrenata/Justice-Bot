const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const User = require("../models/User");
const Story = require("../models/Story");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hikaye')
        .setDescription('Karar vermeye başlama zamanı.'),
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

            await interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`
### Kullanım Şartları
1. Botun sunduğu hizmetlerin kullanımı, Discord'un Kullanım Şartları ve Topluluk Kurallarına uygun olmalıdır. 
2. Botun sunucunuza eklendiği durumda, botun yönetici izinlerine sahip olması önerilir. Ancak, gerekli izinlerin dışında ekstra izinler vermek veya gereksiz izinleri talep etmek güvenlik riski oluşturabilir.
3. Botun kötüye kullanımı yasaktır. Botun bir hata veya açık bulundurduğunu düşünüyorsanız, lütfen geliştiriciye bildirin.
4. Botun kullanımı sırasında oluşabilecek veri kaybı veya diğer olumsuz durumlar için geliştirici sorumlu tutulamaz.
5. Geliştirici, botun özelliklerini ve kullanımını değiştirme hakkını saklı tutar.
6. Botun kullanımı ile ilgili herhangi bir sorunuz veya geri bildiriminiz varsa, lütfen geliştirici ile iletişime geçin.
                    `)],
                components: [row]
            });

            const filter = i => i.customId === 'accept_terms' && i.user.id === userId;
            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 35000 });

            collector.on('collect', async i => {
                collector.stop(); 
                await i.deferUpdate(); 

                user = await User.create({ userId }); 
                await interaction.editReply({ components: [], embeds: [new EmbedBuilder().setDescription('Şartları onayladınız botu kullanabilirsiniz.')] });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ components: [], embeds: [new EmbedBuilder().setDescription('Belirtilen süre içinde şartları kabul etmediniz.')] });
                }
            });
        } else {
            const playedStories = user.playedStories || [];
            const stories = await Story.find({ _id: { $nin: playedStories } });

            if (stories.length === 0) {
                return interaction.reply({ content: "Gösterilecek aktif hikaye bulunamadı.\nGörüş ve Öneri için [Destek Sunucumuzu](https://discord.gg/disbot) ziyaret etmeyi unutmayın.", ephemeral: true });
            }

            const story = stories[Math.floor(Math.random() * stories.length)];

            const shuffledEvents = story.events.sort(() => 0.5 - Math.random());
            const shuffledEvidence = story.evidence.sort(() => 0.5 - Math.random());

            const hiddenEvents = shuffledEvents.slice(0, 1); 
            const hiddenEvidence = shuffledEvidence.slice(0, 1); 

            let hintUsed = false;

            const createEmbed = () => {
                return new EmbedBuilder()
                    .setDescription(`
### **Hikaye:**
${story.description}
### **Olaylar:**
${story.events.map(event => `- ${event}`).join('\n')}`);
            };

            const createRow = () => {
                return new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('view_story')
                            .setLabel('Menü')
                            .setEmoji('🏠')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('view_evidence')
                            .setLabel('Kanıt')
                            .setEmoji('🔍')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('view_witnesses')
                            .setLabel('Tanık')
                            .setEmoji('🙎‍♂️')
                            .setStyle('Secondary'),
                        new ButtonBuilder()
                            .setCustomId('decide_guilt')
                            .setEmoji('🧑‍⚖️')
                            .setLabel('Suçluyu Seç')
                            .setStyle('Danger'),
                        new ButtonBuilder()
                            .setCustomId('use_hint')
                            .setEmoji('💡')
                            .setLabel('İpucu')
                            .setStyle('Primary')
                            .setDisabled(hintUsed)
                    );
            };

            const message = await interaction.reply({
                embeds: [createEmbed()],
                components: [createRow()],
                fetchReply: true
            });

            const filter = i => i.user.id === interaction.user.id;
            const collector = message.createMessageComponentCollector({ filter, time: 600000 });

            collector.on('collect', async i => {
                await i.deferUpdate();

                if (i.customId === 'view_story') {
                    await interaction.editReply({ content: '', embeds: [createEmbed()], components: [createRow()] });
                } else if (i.customId === 'view_evidence') {
                    const evidenceEmbed = new EmbedBuilder()
                        .setTitle('Kanıtlar')
                        .setDescription(story.evidence.map(evidence => hiddenEvidence.includes(evidence) && !hintUsed ? '- ???????????? (İpucu ile açılabilir)' : `- ${evidence}`).join('\n'));
                    await interaction.editReply({ content: '', embeds: [evidenceEmbed], components: [createRow()] });
                } else if (i.customId === 'view_witnesses') {
                    const witnessesEmbed = new EmbedBuilder()
                        .setTitle('Tanıklar')
                        .setDescription(story.witnesses.map(witnesses => `- ${witnesses}`).join('\n'));
                    await interaction.editReply({ content: '', embeds: [witnessesEmbed], components: [createRow()] });
                } else if (i.customId === 'decide_guilt') {
                    const guiltyEmbed = new EmbedBuilder()
                        .setTitle('Suçluyu Seç')
                        .setDescription('Lütfen aşağıdaki butonlardan doğru suçluyu seçin.');

                    const guiltyRow = new ActionRowBuilder()
                        .addComponents(
                            ...story.suspects.map(suspect => new ButtonBuilder()
                                .setCustomId(`guilty_${suspect}`)
                                .setLabel(suspect)
                                .setStyle('Secondary')
                        ));

                    await interaction.editReply({ content: '', embeds: [guiltyEmbed], components: [guiltyRow,
                        new ActionRowBuilder().addComponents(new ButtonBuilder()
                        .setCustomId('back_to_menu')
                        .setEmoji('1251247358776315976')
                        .setLabel('Geri Dön')
                        .setStyle('Danger'))] });
                } else if (i.customId === 'back_to_menu') {
                    await interaction.editReply({ content: '', embeds: [createEmbed()], components: [createRow()] });
                } else if (i.customId === 'use_hint') {
                    if (user.coins >= 1) {
                        user.coins -= 1;
                        await user.save();

                        hintUsed = true;

                        const updatedEmbed = new EmbedBuilder()
                            .setDescription(`
### **Hikaye:**
${story.description}
### **Olaylar:**
${story.events.map(event => `- ${event}`).join('\n')}`);

                        const updatedRow = new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId('view_story')
                                    .setLabel('Menü')
                                    .setEmoji('🏠')
                                    .setStyle('Secondary'),
                                new ButtonBuilder()
                                    .setCustomId('view_evidence')
                                    .setLabel('Kanıt')
                                    .setEmoji('🔍')
                                    .setStyle('Secondary'),
                                new ButtonBuilder()
                                    .setCustomId('view_witnesses')
                                    .setLabel('Tanık')
                                    .setEmoji('🙎‍♂️')
                                    .setStyle('Secondary'),
                                new ButtonBuilder()
                                    .setCustomId('decide_guilt')
                                    .setEmoji('🧑‍⚖️')
                                    .setLabel('Suçluyu Seç')
                                    .setStyle('Danger'),
                                new ButtonBuilder()
                                    .setCustomId('use_hint')
                                    .setEmoji('💡')
                                    .setLabel('İpucu')
                                    .setStyle('Primary')
                                    .setDisabled(true)
                            );

                        await interaction.editReply({ content: '', embeds: [updatedEmbed], components: [updatedRow] });
                    } else {
                        await interaction.followUp({ content: 'Yeterli coininiz bulunmamaktadır.'});
                    }
                } else if (i.customId.startsWith('guilty_')) {
                    const selectedGuilty = i.customId.replace('guilty_', '');
                    if (selectedGuilty === story.correctGuilty) {
                        await interaction.editReply({
                            components: [],
                            embeds: [new EmbedBuilder().setTitle('Tebrikler').setDescription('Başarıyla doğru kişiyi yakaladınız!')]
                        });

                        user.playedStories.push(story._id);
                        user.correctStories = (user.correctStories || 0) + 1;
                        await user.save();
                    } else {
                        await interaction.editReply({
                            components: [],
                            embeds: [new EmbedBuilder().setTitle('Yanlış').setDescription('Yanlış kişiyi seçtiniz.')]
                        });

                        user.playedStories.push(story._id);
                        await user.save();
                    }
                    user.playedStories.push(story._id);
                    await user.save();
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: 'Belirtilen süre içinde bir seçim yapmadınız.' });
                }
            });
        }
    }
};

