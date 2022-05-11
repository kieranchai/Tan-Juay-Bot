import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import moment from 'moment'
import { Markup } from 'telegraf'
import nodeCron from 'node-cron'

const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)
let url = 'https://api.opendota.com/api/players/110236540/recentMatches'
let wordurl = 'https://api.opendota.com/api/players/110236540/wordcloud'
let task
//BOT COMMANDS

bot.command('/alarmOn', (ctx) => {
    if (!task) {
        task = nodeCron.schedule('0 30 17 * * *', () => {
            ctx.reply('ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!')
        }, {
            scheduled: false,
            timezone: "Asia/Singapore"
        })
        ctx.reply('Game Alarm has been turned on.')
        task.start()
    } else {
        ctx.reply('Game Alarm has already been turned on.')
    }

})

bot.command('/alarmOff', (ctx) => {
    if (task) {
        ctx.reply('Game Alarm has been turned off.')
        task.stop()
        task = undefined
    } else {
        ctx.reply('Game Alarm has not been turned on.')
    }
})

bot.start((ctx) => {
    let userFirstName = ctx.message.from.first_name
    let message = `Hello master ${userFirstName}, I am Tan Juay Hee your humble servant.`
    ctx.reply(message, {
        ...Markup.inlineKeyboard([
            //First column
            [Markup.button.callback('R u playing', 'R u playing'),
            Markup.button.callback('Last Match', 'Last Match'),],
            [Markup.button.callback('Word', 'Word'),
            Markup.button.callback('Bulge', 'Bulge'),],
        ])
    })
})

bot.action('Last Match', async (ctx) =>
    fetch(url).then((res) => res.json()).then((data) => {
        let juayResult
        let matchDt = new Date(data[0].start_time * 1000)
        let timeAgo = moment(matchDt).fromNow()
        let juayDuration = data[0].duration
        juayDuration = Math.floor(juayDuration / 60)
        if (data[0].radiant_win == true && data[0].player_slot < 128) {
            juayResult = "won"
        } else if (data[0].radiant_win == true && data[0].player_slot >= 128) {
            juayResult = "lost like a niggin noob"
        } else if (data[0].radiant_win == false && data[0].player_slot < 128) {
            juayResult = "lost like a niggin noob"
        } else if (data[0].radiant_win == false && data[0].player_slot >= 128) {
            juayResult = "won"
        }
        ctx.reply("I last played " + "<b>" + timeAgo + "</b>" + " and I " + juayResult + " after " + juayDuration + " minutes.", { parse_mode: 'HTML' })
    })
)

bot.action('Bulge', async (ctx) => {
    ctx.replyWithPhoto({ source: 'assets/juaydp.jpg' }, { caption: "Don't be sad, have a bulge." })
})

bot.action('Word', async (ctx) => {
    fetch(wordurl).then((res) => res.json()).then((data) => {
        let wordCloud = data.my_word_counts
        let keyNames = Object.keys(wordCloud)
        let randomProperty = (obj) => {
            var keys = Object.keys(obj)
            return obj[keys[keys.length * Math.random() << 0]]
        }
        let sentenceArray = []
        const formatter = new Intl.ListFormat('en', { style: 'narrow', type: 'unit' });
        for (var i = 0; i < 9; i++) {
            sentenceArray.push(randomProperty(keyNames))
        }
        let sentence = formatter.format(sentenceArray)
        ctx.reply(sentence)
        sentenceArray = []
    })
})

bot.action('R u playing', async (ctx) => {
    let answerArray = ['Ok Niggin lo', 'Nah watchin anime', 'Maybe']
    const randomAnswer = answerArray[Math.floor(Math.random() * answerArray.length)];
    ctx.reply(randomAnswer)
})
bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))