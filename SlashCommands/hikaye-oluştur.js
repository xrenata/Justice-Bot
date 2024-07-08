const { SlashCommandBuilder } = require('discord.js');
const { ModalBuilder, TextInputBuilder, ActionRowBuilder, TextInputStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hikaye-oluştur')
        .setDescription('Yeni bir hikaye oluşturur.'),
    async execute(interaction) {
        const member = interaction.member;
        if (!member.roles.cache.has(interaction.client.config.StoryPerm)) {
            await interaction.reply({ content: "Bu komutu kullanmak için yeterli yetkiye sahip değilsiniz.\nGörüş ve Öneri için [Destek Sunucumuzu](https://discord.gg/disbot) ziyaret etmeyi unutmayın.", ephemeral: true });
            return;
        }

        const modal = new ModalBuilder()
            .setCustomId('create_story')
            .setTitle('Yeni Hikaye Oluştur');

        const titleInput = new TextInputBuilder()
            .setCustomId('eventsInput')
            .setLabel('Olaylar')
            .setPlaceholder('Özet şeklinde geçebilirsiniz kısa kısa olayları.\nHer enter bırakımı bir alt satır demek.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const descriptionInput = new TextInputBuilder()
            .setCustomId('descriptionInput')
            .setLabel('Açıklama')
            .setPlaceholder('Hikaye\'nin tamamını buraya yazın.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const evidenceInput = new TextInputBuilder()
            .setCustomId('evidenceInput')
            .setLabel('Kanıtlar')
            .setPlaceholder('Her yeni bir kanıtta yeni bir satır açın.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);


        const witnessesInput = new TextInputBuilder()
            .setCustomId('witnessesInput')
            .setLabel('Tanıklar')
            .setPlaceholder('Tanıkları betimleyerek her yeni tanıkta yeni satır açın.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const guiltyInput = new TextInputBuilder()
            .setCustomId('guiltyInput')
            .setLabel('Suçlu')
            .setPlaceholder('Tüm tanıkları tekrar girin virgül ile ayırarak doğru suçluyu parantez içine alın.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(titleInput); 
        const descriptionRow = new ActionRowBuilder().addComponents(descriptionInput);
        const secondActionRow = new ActionRowBuilder().addComponents(evidenceInput);
        const witnessesRow = new ActionRowBuilder().addComponents(witnessesInput);
        const guiltyRow = new ActionRowBuilder().addComponents(guiltyInput);

        modal.addComponents(firstActionRow, secondActionRow, descriptionRow, witnessesRow, guiltyRow);
        await interaction.showModal(modal);
    }
};
