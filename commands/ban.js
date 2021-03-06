exports.run = (client, message, args) => {
    //ignore dm's
    if (message.channel.type === 'dm')
        return message.channel.send(`You need to be in a server to use this command.`);
    // Most of this command is identical to kick, except that here we'll only let admins do it.
    // In the real world mods could ban too, but this is just an example, right? ;)
    if (!message.channel.permissionsFor(message.member).has("BAN_MEMBERS", false))
        return message.reply("Sorry, you don't have permissions to use this!");

    let member = message.mentions.members.first();
    if (!member)
        return message.reply("Please mention a valid member of this server");
    if (!member.bannable)
        return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");

    let reason = args.slice(1).join(' ');
    if (!reason) reason = "No reason provided";

    member.ban(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: \`\`\`${reason}\`\`\``);
    client.users.resolve(member.user.id).send(`You have been banned from ${message.guild.name} by ${message.author.tag} for \`\`\`${reason}\`\`\``)
}
exports.info = {
    name: `ban`,
    aliases: [],
    description: `Ban someone!`,
    usage: `ban <mention> [reason]`,
    category: `Admin`
}