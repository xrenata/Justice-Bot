const ChatInputInteraction = require('./interaction/ChatInput');
const ModalInteraction = require('./interaction/Modal');
const ContextMenuInteraction = require('./interaction/ContextMenu');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		if (interaction.isChatInputCommand()) await ChatInputInteraction(interaction)
		else if (interaction.isModalSubmit()) await ModalInteraction(interaction)
		else if (interaction.isContextMenuCommand()) await ContextMenuInteraction(interaction)
	},
};