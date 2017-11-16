const fs = require('fs');
const { Client, Message, MessageEmbed, Collection, GuildMember } = require('discord.js');
const { Command, Arguments, CreativeClient, ClientModes } = require('../types');
const { config, tokens } = require('./config');
const request = require('superagent');

const GuildData = require('../models/guild');
/**
 * @param { String } searchFor
 * @returns { Boolean }
 */
String.prototype.contains = function(searchFor) {
    const v = (this || '').toLowerCase();
    let v2 = searchFor;
    if (v2) {
        v2 = v2.toLowerCase();
    }
    return v.indexOf(v2) > -1;
}

/**
 * Used for Capitilizing first letter of sentece
 * @returns { String }
 */
String.prototype.firstLetterToUpperCase = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

module.exports = {
    /**
    * Audits an embeded message to our audit channel
    * @param { GuildMember } member
    * @param { String } reason title of embed
    * @param { String } message message of embed
    * @param { Boolean } warning message of embed
    */
    auditMessage(member, message, warning = false) {

        if (!member.guild) return;

        GuildData.findOne({id: member.guild.id}, (err, guild) => {
            if (!guild || !guild.channels || !guild.channels.audit) return;
            const auditChannel = member.client.channels.get(guild.channels.audit);
    
            if (auditChannel) {
                const embed = this.getEmbed()
                .setColor(warning ? 0xf44242 : 0xf4eb41)
                .setDescription(message)
                .setAuthor(`${member.user.username}#${member.user.discriminator}`, member.user.avatarURL());
                auditChannel.send({embed});
            }
        })
    },
    /**
     * Searches youtube and returns top 5 results
     * @param { String } keywords Search Keywords
     * @param { GuildMember } author Member who is searching
     * @param { Function } callback Called after data is found
     */
    youtubeSearch(keywords, author, callback) {
        let requestUrl = 'https://www.googleapis.com/youtube/v3/search' + `?part=snippet&q=${escape(keywords)}&key=${tokens.youtube}`;

        request.get(requestUrl, (err, res) => {
            console.log('test');
            if (res.statusCode == 200) {
                const body = res.body;
                if (body.items.length == 0) {
                    callback({ error: "Couldn't find any videos matching those tags" });
                    return;
                }
                
                let videos = [];

                for (let item of body.items) {
                    if (item.id.kind == 'youtube#video') {
                        const videoId = item.id.videoId;
                        videos.push({
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                            title: item.snippet.title,
                            thumbnail: item.snippet.thumbnails.medium.url,
                            requestor: author,
                            videoId: item.id.videoId
                        });
                    }
                }

                callback({
                    results: videos,
                    error: ""
                });
                return;
            }
            else {
                callback({ error: "Couldn't contact Youtube" });
            }
        });
        return;
    },
    spotifySearch(keywords, callback) {
        request.get('https://api.spotify.com/v1/authorize', (err, res) => {
            console.log(res.body);
        });
    },
    /**
     * Returns true if member has role listed in command
     * @param { GuildMember } member
     * @param { Command } command
     * @returns { Boolean }
     */
    canUse(member, command) {

        if (!command.roles) {
            return true;
        }

        if (member.guild.available) {
            for (const role of command.roles) {
                if(member.guild.roles.has(role)) {
                    return true;
                }
            }
        }

        return false;

    },
    /**
     * Returns a general embeded template that we like to use
     * @returns { MessageEmbed }
     */
    getEmbed() {
        const embed = new MessageEmbed()
        .setColor(this.botColor)
        .setTimestamp()
        .setFooter("love, your friendly bot");

        return embed;
    },
    /**
     * General color of the bot used for embeded messages
     */
    botColor: 0x8754ff,
    /**
     * Used for if we should return when handling messages
     * @param { CreativeClient } client
     * @param { Message } message Message from handler
     * @returns { Boolean }
     */
    shouldCheckMessage(client, message) {
        return (client.mode === ClientModes.DEBUG && message.channel.id != config.channels.testing) 
        || (client.mode === ClientModes.SHIPPING) && message.channel.id == config.channels.testing 
        || message.author.bot;
    },
    /**
     * Gets all commands
     * @returns { Collection<String, Command> }
     */
    getCommands() {
        let commands = new Collection();
        
        const generalFiles = fs.readdirSync('./commands/general');
        
        for (const file of generalFiles) {
            const command = require(`../commands/general/${file}`);
            commands.set(command.name, command);
        }

        const moderationFiles = fs.readdirSync('./commands/moderation');
        
        for (const file of moderationFiles) {
            const command = require(`../commands/moderation/${file}`);
            commands.set(command.name, command);
        }

        const musicFiles = fs.readdirSync('./commands/music');
        
        for (const file of musicFiles) {
            const command = require(`../commands/music/${file}`);
            commands.set(command.name, command);
        }

        return commands;
    },
    /**
     * 
     * @param { Number } totalPoints 
     * @returns { Number }
     */
    getRankFromTotalPoints(totalPoints) {
        let points = 0;
        let rank = 0;
        while(points < totalPoints) {
            rank++;
            points += config.rank.exponential * rank;
        }

        return rank;
    },
    /**
     * 
     * @param { Number } rank 
     * @returns { Number }
     */
    getTotalPointsFromRank(rank) {
        let points = 0;
        for (let i = 0; i < rank; i++) {
            points += config.rank.exponential * i;
        }

        return points;
    },
    /**
     * @param { Message } message
     * @param { Command } command
     */
    executeCommandHelp(message, command) {
        this.getCommands().get('help').execute(message, [command.name]);
    }
};