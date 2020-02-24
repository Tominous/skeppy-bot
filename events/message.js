module.exports = (client, message) => {
  // Ignore all bots
  if (message.isMentioned(client.user)) {
    if(message.content == "<@!"+client.user.id+">")
    message.channel.send(`Hi ${message.author.toString()}. For help look at https://docs.skeppybot.xyz`);
  }
  if (message.author.bot) return;
  //ignore dm's
if (message.channel.type === 'dm')
      return;

  let score;
  if (message.guild) { 
    client.npSettings.ensure(message.guild.id, client.defaultSettings);
    if (client.npSettings.get(message.guild.id, "levels")){
      score = client.getScore.get(message.author.id, message.guild.id);
      if (!score) {
        score = { id: `${message.guild.id}-${message.author.id}`, user: message.author.id, guild: message.guild.id, points: 0, level: 1 }
      }
      score.points++;
      const curLevel = Math.floor(0.1 * Math.sqrt(score.points));
      if(client.autorole.has(message.guild.id)){
        try {
          for(let i = 0; i <= curLevel; i++){
            if(client.autorole.has(message.guild.id, i.toString())){
              message.member.addRole(client.autorole.get(message.guild.id, i.toString()))
              .catch(console.log)
            }
          }
        } catch(e) {
          console.log(e)
        }
      }
      if(score.level < curLevel) {
        score.level++;
        message.reply(`You've leveled up to level **${curLevel}**!`);
      }
      client.setScore.run(score);
    }
  }

  const prefixes = require('../config.json').prefix
  let prefix = false;
  for (const thisPrefix of prefixes) {
      if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
  }
//  if(!prefix) return;

  // Ignore messages not starting with the prefix (in config.json)
  if (message.content.toLowerCase().indexOf(prefix) !== 0) return;

  // Our standard argument/command name definition.
  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();
  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);
  const incStats = async () => {
    const stats = await client.stats.get("executedCommands")
    if(stats){
      client.stats.set("executedCommands", parseInt(stats) + 1)
    } else {
      client.stats.set("executedCommands", 1)
    }
  }
 
  if (cmd){
    incStats()
    try {
      cmd.run(client, message, args);
    } catch(e) {
      console.log(e)
    }
  }

  const aliasCmd = client.aliases.get(command)
  if(aliasCmd){
    incStats()
    try {
      aliasCmd.run(client, message, args)
    } catch(e) {
      console.log(e)
    }
  }
};
