exports.run = (client, message, args) => {
  function getA6d() {
    var a6d = [
        "a6doo",
        "a6diarrhea",
        "a6dee",
        "outvadedlands is just great!",
        "a6d french guy",
        "a6d likes baguettes",
        "French Server Owner"
        ];
    return a6d[Math.floor(Math.random() * a6d.length)];
  }

    var a6d = getA6d();
    message.channel.send(a6d)
}
exports.run = (client, message, args) => {
  message.channel.send('i need to make this')
}
exports.info = {
  name: `a6d`,
  aliases: [],
  description: `A6d command, currently does nothing.`,
  usage: `a6d`,
  category: `TheTrio`
}
