import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import moment from 'moment'

const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)
let url = 'https://api.opendota.com/api/players/110236540/recentMatches'
let wordurl = 'https://api.opendota.com/api/players/110236540/wordcloud'

//BOT COMMANDS
bot.start((ctx) => ctx.reply("Hello, I'm Tan Juay Hee. Please ask whether I'm playing to get started!"))

bot.hears('u playing?', async (ctx) =>
    fetch(url).then((res) => res.json()).then((data) => {
        let juayResult
        let matchDt = new Date(data[0].start_time * 1000)
        let timeAgo = moment(matchDt).fromNow()
        if (data[0].radiant_win == true && data[0].player_slot < 128) {
            juayResult = "won!!!"
        } else if (data[0].radiant_win == true && data[0].player_slot >= 128) {
            juayResult = "lost like a niggin noob"
        } else if (data[0].radiant_win == false && data[0].player_slot < 128) {
            juayResult = "lost like a niggin noob"
        } else if (data[0].radiant_win == false && data[0].player_slot >= 128) {
            juayResult = "won!!!"
        };
        ctx.reply("I last played " + timeAgo + " and I " + juayResult)
    })
)

bot.hears('word', async (ctx) => {
    fetch(wordurl).then((res) => res.json()).then((data) => {
        let wordCloud = data.my_word_counts
        let keyNames = Object.keys(wordCloud)
        let randomProperty = (obj) => {
            var keys = Object.keys(obj)
            return obj[keys[keys.length * Math.random() << 0]]
        }
        ctx.reply(randomProperty(keyNames))
    })
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))