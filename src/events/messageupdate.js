const { Message } = require('discord.js');
const { CreativeClient } = require('../types');
const utils = require('../util/utils');

/**
 * @param { CreativeClient } client 
 * @param { Message } oldMessage
 * @param { Message } newMessage
 */
module.exports = async (client, oldMessage, newMessage) => {
    if (client.mode === ClientModes.DEBUG) {
        return;
    }

    if (oldMessage.author.bot || (oldMessage.content === '' && newMessage.content === '') || oldMessage.content === newMessage.content) {
        return;
    }
    utils.auditMessage(message.member, `Changed "${oldMessage.content}" to "${newMessage.content}" in ${newMessage.channel.toString()}`);
}