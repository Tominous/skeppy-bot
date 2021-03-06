const Canvas = require('canvas');
const Discord = require('discord.js');
//ty discordjs.guide
exports.run = async (client, message, args) => {
    if(args[0]){
        const user = message.mentions.users.first()
        if(user){
            return createImage(user);
        }
        if (!user) {
			      return message.reply('Are you stupid? Just mention someone, smh');
		    }
    }
    createImage(message.author)
    async function createImage(userMention) {
        const canvas = Canvas.createCanvas(474, 474);
        const ctx = canvas.getContext('2d');
        const background = await Canvas.loadImage('./img/pinecone.jpg');
        // This uses the canvas dimensions to stretch the image onto the entire canvas
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
        const avatar = await Canvas.loadImage(userMention.avatarURL);
        ctx.drawImage(avatar, 167.1, 142.6, 130, 130);
    
        // Use helpful Attachment class structure to process the file for you
        const attachment = new Discord.Attachment(canvas.toBuffer(), 'pinecone.png');
        message.channel.send(attachment)
    }
}
exports.info = {
    name: `pinecone`,
    aliases: [],
    description: `Puts your avatar on a pinecone`,
    usage: `pinecone [mention]`,
    category: `Fun`
  }