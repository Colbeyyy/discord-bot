const { Message } = require('discord.js');
const Arguments = require('../../types/arguments'); 
const { GuildData } = require('../../models')
const utils = require('../../util');

module.exports = {
    name: 'help',
    category: 'general',
    /**
     * @param {Message} message 
     * @param {Arguments} args 
     * @returns {Promise<Boolean>}
     */
    async execute(message, args) {
        
        GuildData.findOne({id: message.guild.id}, (err, res) => {

            if (err) {
                console.error(err);
                return;
            }

            if (!res.setupComplete) {
                const embed = utils.getEmbed();

                embed.setTitle('Setup Help');

                embed.setDescription(
                      'Any administrator of this server needs to use the `;command` command\n'
                    + 'We reccommend doing `;command moderation add @<youradmingroup>`\n'
                    + 'after any use of the `;command` will turn off setup mode'
                );

                message.channel.send(embed);

                return false;
            }

            if (args.length > 0) {
                const searchCommand = utils.getCommands().get(args[0]);
                const embed = utils.getEmbed();
                if (searchCommand && utils.canUse(message.member, searchCommand)) {
                    embed.addField(searchCommand.name.firstLetterToUpperCase(), searchCommand.help);
    
                    if (searchCommand.example) embed.addField('Example', searchCommand.example);
    
                    message.channel.send({embed});
                }
                else {
                    const commands = utils.getCommands().filter((command) => {
                        return command.category == args[0];
                    }).array();
                    
                    if (commands.length > 0)
                    {
                        embed.setTitle(`${args[0].firstLetterToUpperCase()} Commands`)
    
                        for (const command of commands) {
                            if (!command.help) continue;
    
                            embed.addField(command.name, command.help);
                        }
    
                        message.channel.send({embed});
                    }
                }
            }
            else {
                const embed = utils.getEmbed();
                
                embed.setTitle('Help Commands');
                embed.setDescription('`;help` can also be used as `;help command` or `;help category`');
                const commands = utils.getCommands().array();
    
                for (const command of commands) {
                    if (!command.help) continue;
    
                    if (command.name != this.name && command.category !== 'moderation' && command.help.length < 1024) {
                        embed.addField(command.name, command.help);
                    }
                }
    
                message.author.createDM().then((channel) => {
                    channel.send({embed});
                    message.reply('we sent you a DM with all of our amazing commands');
                }).catch(() => {
                    message.reply('looks like we couldnt send you a dm');
                });
    
            }

        });

        return false;
    }
}