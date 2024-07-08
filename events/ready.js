const { ActivityType } = require('discord.js');
const chalk = require('chalk');
const axios = require('axios');
const cron = require('node-cron');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        const apiKey = client.config.DPlaceAPI;
        console.log(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[BOT] ') + chalk.green('Bot is up!'));

        const usersCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const serversCount = client.guilds.cache.size;
        const commandCount = client.slashCommands.size;
		
        const updateDPlaceStats = () => {
            const mockData = {
                server_count: serversCount,
                command_count: commandCount
            };

            axios.patch(`https://api.discord.place/bots/${client.user.id}/stats`, mockData, {
                headers: {
                    'Authorization': apiKey
                }
            })
            .then(response => {
                if (response.data.success) {
                    console.log(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[DPLACE] ') + chalk.green('Updated commands on API.'));
                } else {
                    console.log(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[DPLACE] ') + chalk.red('Failed to update commands on API.'));
                }
            })
            .catch(error => {
                console.error(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[DPLACE] ') + chalk.red('Error updating commands on API:'), error.message);
            });
        };

        cron.schedule('59 11 * * *', () => {
            console.log(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[DPLACE] ') + chalk.green('Running discord.place API update at 11:59'));
            updateDPlaceStats();
        });

        client.user.setActivity(`Kullanıcı: ${usersCount} | Sunucu: ${serversCount}`, { type: ActivityType.Custom });
        client.user.setStatus('online');
    },
};
