const Discord = require('discord.js');
const axios = require('axios')

exports.run = async (client, message, args) => {
    var location = args.join(" ")
    axios.get(`https://api.ksoft.si/kumo/weather/currently?q=${location}`, {headers: {'Authorization': 'Bearer '+client.config.ksoftApi}})
    .then(res => {
        var data = res.data.data;
        var time = data.time;
        var summary = data.summary;
        var temperature = Math.round(data.temperature);
        var location = data.location.address;
        var cloudCover = Math.floor((data.cloudCover / 1) * 100)
        var humidity = Math.floor((data.humidity / 1) * 100)
        var windSpeed = data.windSpeed
        var icon = data.icon_url;
        var embed = new Discord.RichEmbed()
            .setTitle(`${temperature}°C/°F ${summary}`)
            //.setDescription(summary)
            .setColor(`GREEN`)
            .setThumbnail(icon)
            .addField(`Temperature`, `${temperature}°C/°F`, true)
            .addField(`Cloud cover`, `${cloudCover}%`, true)
            .addField(`Humidity`, `${humidity}%`, true)
            .addField(`Windspeed`, windSpeed, true)
            .setTimestamp(time)
            .setFooter(`${location} | Powered by KSoft`)
        message.channel.send(embed)
    })
    .catch(function (error) {
        // handle error
        var embed = new Discord.RichEmbed()
            .setTitle(`❌ Error`)
            .setColor(`RED`)
            .setDescription(`Couldn't find weather information for ${args.join(' ')}`)
        return message.channel.send(embed);
    })
}