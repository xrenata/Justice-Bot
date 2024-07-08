const Story = require("../../models/Story");

module.exports = async function ModalInteraction(interaction) {
    if (interaction.customId === 'create_story') {
        const events = interaction.fields.getTextInputValue('eventsInput').split('\n');
        const description = interaction.fields.getTextInputValue('descriptionInput');
        const evidence = interaction.fields.getTextInputValue('evidenceInput').split('\n');
        const witnesses = interaction.fields.getTextInputValue('witnessesInput').split('\n');
        const suspectsInput = interaction.fields.getTextInputValue('guiltyInput');

        const suspects = [];
        let correctGuilty = '';
        suspectsInput.split(',').forEach(suspect => {
            const trimmedSuspect = suspect.trim();
            const match = /\(([^)]+)\)/.exec(trimmedSuspect);
            if (match) {
                correctGuilty = match[1];
                suspects.push(match[1].trim());
            } else {
                suspects.push(trimmedSuspect);
            }
        });

        const newStory = new Story({
            title: 'Yeni Hikaye', 
            description,
            events,
            evidence,
            witnesses,
            suspects,
            correctGuilty
        });

        await newStory.save();

        interaction.reply({
            content: 'Yeni hikaye başarıyla oluşturuldu.',
            ephemeral: true
        });
    }
}