// Legacy (discord.js-musicbot-addon)

exports.run = (client, message, args) => {
  const searchstring = args.join(" ");
  if (searchstring.includes(".mp3") && message.member.voiceChannel){
      const connection = message.member.voiceChannel.join().then(connection => {
      const dispatcher = connection.playStream(searchstring);
      message.react("✅");
      });
    } else {
    client.music.bot.playFunction(message, searchstring);
  }
}

// Lavalink version

const axios = require('axios');
const Discord = require('discord.js');
const internetradio = require('node-internet-radio');

const defaultRegions = {
    asia: ["sydney", "singapore", "japan", "hongkong"],
    eu: ["london", "frankfurt", "amsterdam", "russia", "eu-central", "eu-west"],
    us: ["us-central", "us-west", "us-east", "us-south", "brazil"]
};


exports.run = async(client, message, args) => {
        var config = client.config;
        async function getSongs(search, userid) {
            return new Promise(async(resolve, rej) => {
                        try {
                            const res = await axios.get(`${config.lavalink.searchnode.address ? config.lavalink.searchnode.address : `https://${config.lavalink.searchnode.host}:${config.lavalink.searchnode.port}`}/loadtracks?identifier=${encodeURIComponent(search)}`, {
          headers: {
            Authorization: config.lavalink.searchnode.password
          }
        });
        var results = res.data.tracks
        console.log(res.data)
        if(!res.data.tracks || res.data.loadType == 'NO_MATCHES') return message.channel.send(`No results found.`) && message.channel.stopTyping();
        results.forEach((results) => {
          results.requestedBy = userid
        })
        resolve(results);
      } catch (e) {
        message.channel.send(`Track not found.`);
        resolve(e);
      }
    });
  }

  function getIdealHost(bot, region) {
    region = getRegion(bot, region);
    const foundNode = bot.player.nodes.find(node => node.ready && node.region === region);
    if (foundNode) return foundNode.host;
    return bot.player.nodes.first().host;
  }

  function getRegion(bot, region) {
    region = region.replace("vip-", "");
    for (const key in defaultRegions) {
      const nodes = bot.player.nodes.filter(node => node.connected && node.region === key);
      if (!nodes) continue;
      for (const id of defaultRegions[key]) {
        if (id === region || region.startsWith(id) || region.includes(id)) return key;
      }
    }
    return "eu";
  }
  var bot = client; // Shush.
  var msg = message; // Also shush
  const betterArgs = args.join(' ').trim();
  let canPlay = false;
  await message.channel.send(`Hold on...`);
  if (!msg.member.voice.channel)
    return message.channel.send(`You're not in a voice channel!`);

  if (bot.player.players.get(message.guild.id) && msg.member.voice.channel.id !== bot.player.players.get(message.guild.id).channel)
    return message.channel.send(`You're not in the playing voice channel!`);

  if (!betterArgs && !bot.player.get(message.guild.id))
    return message.channel.send(`You didn't give anything to play!`);

  await message.channel.startTyping()
  const m = await message.channel.send(`Hold on...`)


  var queue = bot.getQueue(message.guild.id);
  var track = await getSongs(betterArgs.startsWith(`http`) ? betterArgs : `ytsearch:${betterArgs}`, message.author.id);
  console.log(track)
  var requestedBy = track.userid
  if (track instanceof Error)
    if (e) {
      message.channel.stopTyping();
      return message.channel.send(`Track search failed with error \n\`\`\`xl\n${e.toString()}\n\`\`\``) && message.channel.stopTyping();
    } else {
      message.channel.stopTyping();
      return message.channel.send(`Track search failed with an unknown error!`)
    }
  const urlParams = new URLSearchParams(args.join(' '));
  const myParam = parseInt(urlParams.get('index'));

  if (!track[0]) return message.channel.send(`No results found.`);

  if (!betterArgs.startsWith(`http`)) {
    var list = track.map((t, i) => {
      return `**${i + 1}** ${t.info.title || 'Unknown'} \`${bot.getYTLength(t.info.length) || 'Unknown'}\``;
    })
    if(list.length > 10){
      list.splice(10)
    }
    const embed = new Discord.MessageEmbed()
    .setTitle(`Song selection`)
    .setColor("0357ff")
    .setDescription(`${list.join('\n')}\n Send the number of the song you want to play. (1-10)`)

      m.edit("", embed)
    .then(() => {
      message.channel.awaitMessages(response => response.author.id == message.author.id && (parseInt(response.content) || response.content == "cancel"), {
        max: 1,
        time: 30000,
        errors: ['time'],
      })
      .then((collected) => {
        if(parseInt(collected.first().content) == NaN || !parseInt(collected.first().content)){
          m.then(m => {
            m.edit(new Discord.MessageEmbed().setColor("0357ff").setTitle(`Selection closed.`))
          })
          message.channel.send(`You must specify a number between 1 and 10!`);
          return;
        }
        if(collected.first().content == "cancel") {
          m.edit("Canceled.")
          return;
        }
        if(collected.first().content < 1 || collected.first().content > 10){
            m.edit("", new Discord.MessageEmbed().setColor("0357ff").setTitle(`Selection closed.`))
          message.channel.send(`You must specify a number between 1 and 10!`);
          return;
        }
        if (!queue[0]) {
          canPlay = true;
          queue.startedBy = message.author.id;
        }
        collected.first().delete().catch(console.log)
        queue.push(track[parseInt(collected.first().content) - 1]);
        const songData = track[parseInt(collected.first().content) - 1]
        const playEmbed = new Discord.MessageEmbed()
        .setColor("0357ff")
        .setAuthor(`Added song to queue!`)
        .setTitle(songData.info.title)
        .setThumbnail(`https://i.ytimg.com/vi/${songData.info.identifier}/hqdefault.jpg`)
        .setFooter(`Length: ${client.getYTLength(songData.info.length)} | ${songData.info.author}`)
        .setDescription(`• **URL**: [${songData.info.uri}](${songData.info.uri})`)
        m.edit("Added song to queue!", playEmbed)
        if (canPlay) {
          var theHost = getIdealHost(bot, message.guild.region);
          const player = bot.player.join({
            guild: message.guild.id,
            channel: message.member.voice.channel.id,
            host: theHost
          });
          bot.player.players.get(message.guild.id).node = bot.player.nodes.get(theHost);
          bot.execQueue(message, queue, player, true);
        }
      })
      .catch((e) => {
        console.log(e)
        m.then(m => {
          m.edit(new Discord.MessageEmbed().setColor("0357ff").setTitle(`Selection closed.`))
        })
      });
    });
  return;
  }

  if (!queue[0]) {
    canPlay = true;
    queue.startedBy = message.author.id;
  }
  if (urlParams.get('list') && myParam) {
    track = track.splice(myParam - 1, track.length);
    track.forEach((cr, i) => {
      queue.push(cr);
    });
  } else if (urlParams.get('list')) {
    track.forEach((cr) => {
      queue.push(cr);
    });
  } else {
    queue.push(track[0]);
  }
  let length = bot.getYTLength(track[0].info.length)
  let song = track[0].info.title
  if (track[0].info.length >= 9223372036854776000) {
    length = `Live`
    if(!track[0].info.uri.startsWith("https://twitch.tv")){
      await getStreamMeta(track[0].info.uri)
      .then((song) => {
        song = song
      })
    }
  }
  async function getStreamMeta(url) {
    return new Promise((resolve) => {
      internetradio.getStationInfo(url, function (error, station) {
        song = station.title;
        resolve(song);
      });
    });
  }
  message.channel.stopTyping()
  m.then(m => {
    m.edit(new Discord.MessageEmbed()
      .setColor("0357ff")
      .setAuthor(`Added ${urlParams.get('list') ? "playlist" : "song"} to queue!`)
      .setTitle(song)
      .setThumbnail(`https://i.ytimg.com/vi/${track[0].info.identifier}/hqdefault.jpg`)
      .setFooter(`Length: ${length} | ${track[0].info.author}`)
      .setDescription(`
• **URL**: [${track[0].info.uri}](${track[0].info.uri})
`));
  })
  message.channel.send(new Discord.MessageEmbed()
  .setColor("0357ff")
  .setAuthor(`Added ${urlParams.get('list') ? "playlist" : "song"} to queue!`)
  .setTitle(song)
  .setThumbnail(`https://i.ytimg.com/vi/${track[0].info.identifier}/hqdefault.jpg`)
  .setFooter(`Length: ${length} | ${track[0].info.author}`)
  .setDescription(`
• **URL**: [${track[0].info.uri}](${track[0].info.uri})
  `));

  if (canPlay) {
    var theHost = getIdealHost(bot, message.guild.region);
    const player = await bot.player.join({
      guild: message.guild.id,
      channel: message.member.voice.channel.id,
      host: theHost
    });
    bot.player.get(message.guild.id).node = bot.player.nodes.get(theHost);
    bot.execQueue(message, queue, player, true);
  }
}

exports.info = {
  name: `play`,
  aliases: [`p`],
  description: `Play music!`,
  usage: `play <song title/twitch url/soundcloud url/mp3 url>`,
  category: `Music`,
  lock: true
}
