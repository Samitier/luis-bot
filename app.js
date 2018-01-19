require('dotenv').config()


const 	builder = require('botbuilder'),
        restify = require('restify'),
        axios = require('axios')

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
	session => {
		session.send("You have a problem.")
		session.endDialog()
	}
).triggerAction({
	matches: "GetProblem"
})

bot.dialog("GetGif",
	(session, args) => {
        let {entities} = args.intent
        if(entities.length){
            axios.get(process.env.GIPHY_RANDOM_URI + entities[0].entity)
            .then(function (response) {
                session.send(response.data.data.image_url)
            })
            .catch(function (error) {
                console.log(error);
            });
        }
        else {
            axios.get(process.env.GIPHY_TRENDING_URI)
            .then(function (response) {
                session.send('https://media2.giphy.com/media/d1E1msx7Yw5Ne1Fe/giphy.gif')
            })
            .catch(function (error) {
                console.log(error);
            });
        }
		session.endDialog()
	}
).triggerAction({
	matches: "GetGif"
})

bot.dialog("None",
	session => {
		session.send("You want nothing.")
		session.endDialog()
	}
).triggerAction({
	matches: "None"
})