const { Message } = require('discord.js');
const Arguments = require('../../types/arguments'); 
const utils = require('../../util');
const ProfileData = require('../../models/profile');

module.exports = {
    name: 'mute',
    category: 'moderation',
    help: '`;mute <user>` to mute that user',
    example: '`;mute @Colby`',
    /**
     * @param {Message} message 
     * @param {Arguments} args 
     * @returns {Promise<Boolean>}
     */
    async execute(message, args) {

        if (!utils.canUse(message.member, this)) return;

        if (!args[0]) {
            utils.executeCommandHelp(message, this);
            return false;
        }

        const member = message.guild.members.find((member) => {
            return member.toString() === args[0];
        });

        if (!member) {
            message.reply('sorry we could not find that member');
            return false;
        }

        message.channel.overwritePermissions(member.user, {
            SEND_MESSAGES: false
        });

        ProfileData.findOne({id: member.id}, (err, profile) => {

            if (!profile) return;

            const guild = profile.guilds.find((guild) => {
                return guild.id === message.guild.id;
            });

            if (!guild) return;

            guild.mutes.push(message.channel.id);

            profile.save();
        });

        return true;
    }
}