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
    session.send("You said: %s", session.message.text)
})