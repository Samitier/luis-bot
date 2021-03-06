require('dotenv').config()


const 	builder = require('botbuilder'),
		restify = require('restify'),
		axios = require('axios'),
		weather = require('weather-js')

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


const bot = new builder.UniversalBot(connector, session => {})

const recognizer = new builder.LuisRecognizer(process.env.LUIS_URI)
bot.recognizer(recognizer)

bot.dialog("GetProblem",
	async (session, args) => {
		let { entities } = args.intent
		if (entities.length) {
			const entity = entities[0].entity.split(' ').join('%20')
			try {
				let title = (
					await axios.get(`https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${ entity }&format=json`)
				).data.query.search[0].title.split(' ').join('+')
				let resp = await axios.get(`https://es.wikipedia.org/w/api.php?action=opensearch&search=${ title }&limit=1&namespace=0&format=json`)
				if(resp.data[2]) session.send(resp.data[2])
			}
			catch(e) { console.error("Wikipedia call failed.") }
		}
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

bot.dialog("GetGifClass",
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
            axios.get(process.env.GIPHY_NO_URI)
            .then(function (response) {
                session.send(response.data.data.images.fixed_width.url)
            })
            .catch(function (error) {
                console.log(error);
            });
        }
		session.endDialog()
	}
).triggerAction({
	matches: "GetGifClass"
})

bot.dialog("None",
	session => {
		session.send('https://media.giphy.com/media/6J9EYB2Z27Qg8/giphy.gif')
		session.endDialog()
	}
).triggerAction({
	matches: "None"
})

bot.dialog("GetWeather", 
	(session, args) => {
		let { entities } = args.intent
		weather.find({search: 'Barcelona, Spain', degreeType: 'C'}, (err, result) => {
			if(!err) {
				let isTomorrow = entities[0] && entities[0].resolution.values[0] === 'Mañana'
				if (isTomorrow) {
					let forecast = result[0].forecast[2]
					session.send(
						`En Barcelona, mañana estaremos de ${ forecast.low }ºC a ${ forecast.high }ºC. `
						+ `Hará un cielo ${ forecast.skycode == 32 
							? "soleado" 
							: forecast.skycode == 34 || forecast.skycode == 30 
								? "moderadamente soleado" 
								: "nublado"
						}`
						+ `, con un ${ forecast.precip || 0 }% de probabilidades de lluvia.`
					)
				}
				else {
					let forecast = result[0].current
					session.send(
						`En Barcelona, estamos a ${ forecast.temperature }ºC. `
						+ `Hace un cielo ${ forecast.skycode == 32 ? "soleado" : "nublado" }`
						+ `, con un ${ forecast.humidity }% de humedad.`
					)
				}
			}
			session.endDialog()
			console.log(JSON.stringify(result, null, 2));
		})
	}
).triggerAction({
	matches: "GetWeather"
})