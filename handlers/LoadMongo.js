const mongoose = require('mongoose');
const chalk = require('chalk');

async function LoadMongo(client) {
    try {
        await mongoose.connect(client.config.MongoUri, {
        });
        console.log(chalk.yellow(`[${client.config.prefix}] `) + chalk.cyan('[DB] ') + chalk.green('MongoDB connection true.'))
    } catch (e) {
        console.log('Mongo connetion error:' + e);
    }
}

module.exports = LoadMongo;
