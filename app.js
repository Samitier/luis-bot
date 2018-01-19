require('dotenv').config()

const 	builder = require('botbuilder'),
		restify = require('restify')

const server = restify.createServer();

server.listen(process.env.port || process.env.PORT || 3978, () => {
	console.log('%s listening to %s', server.name, server.url)
})

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
})

server.post('/api/messages', connector.listen())


const bot = new builder.UniversalBot(connector, session => {
    session.send("Perdona amigo, pero no he entendido tu mensaje :(")
})

const recognizer = new builder.LuisRecognizer(process.env.LUIS_URI)
bot.recognizer(recognizer)

bot.dialog("GetProblem",
	session => session.send("You have a problem.")
).triggerAction({
	matches: "GetProblem"
})

bot.dialog("GetGif",
	session => session.send("You want a gif.")
).triggerAction({
	matches: "GetGif"
})

bot.dialog("None",
	session => session.send("You want nothing.")
).triggerAction({
	matches: "None"
})