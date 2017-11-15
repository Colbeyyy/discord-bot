const Discord = require('discord.js');

const Arguments = require('../types/arguments'); 
const Message = Discord.Message;

const utils = require('../utils');

module.exports = {
    name: 'unban',
    category: 'moderation',
    help: '`;unban user reason` to unban the user for that reason\n`;unban user` to ban that user',
    /**
     * @param {Message} message 
     * @param {Arguments} args 
     * @returns {Promise<Boolean>}
     */
    async execute(message, args) {

        if (!utils.canUse(message.author, this)) return;
        
        let banned = message.guild.fetchBans().then((banned) => {
            let member = banned.find((member) => {
                return member.toString() === args[0]
            });

            if (!member) {
                message.reply('sorry we could\'nt find that member');
                return;
            }

            if (args[1]) {
                member.createDM().then((channel) => {
                    let embed = utils.getEmbed();
                    embed.setAuthor(`${message.guild.name} Staff`, message.guild.iconURL());
                    embed.addField('You have been unbanned', `Reason: "${args.toString(1)}"`);
                    
                    channel.send({embed});
                    message.guild.unban(member.id);
                });
                return true;
            }
            else {
                message.guild.unban(member.id);
                return true;
            }
        });

        return false;
    }
}