import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import moment from 'moment'
import { Markup } from 'telegraf'
import nodeCron from 'node-cron'

let url = 'https://api.opendota.com/api/players/110236540/'
let heroNamesUrl = 'https://raw.githubusercontent.com/odota/dotaconstants/master/build/hero_names.json'
let task
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)

//BOT COMMANDS
bot.command('/alarmOn', (ctx) => {
    if (!task) {
        task = nodeCron.schedule('0 30 17 * * *', () => {
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            ctx.replyWithAudio({source: `assets/alarm.mp3`})
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
            [Markup.button.callback('Last Match', 'Last Match'),],
            [Markup.button.callback('Sentence', 'Sentence'),
            Markup.button.callback('Bulge', 'Bulge'),],
        ])
    })
})

bot.on('text', async (ctx) => {
    if (((ctx.message.text).toLowerCase()).includes('play')) {
        let answerArray = ['Ok play lo any niggins', 'Nah watchin anime', 'Maybe maybe not y dont u suck my dick first and well see']
        const randomAnswer = answerArray[Math.floor(Math.random() * answerArray.length)];
        ctx.reply(randomAnswer)
    }
})

bot.action('Last Match', async (ctx) =>
    fetch(url+'recentMatches').then((res) => res.json()).then((data) => {
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
        ctx.reply("I last played " + "<b>" + timeAgo + "</b>" + " and I " + juayResult + " after " + juayDuration + " minutes.",
            {
                ...Markup.inlineKeyboard([
                    [Markup.button.callback('Match Details', 'Match Details'),]
                ]),
                parse_mode: 'HTML'
            })
        let winstreak = 0
        let losestreak = 0
        for (var i = 0; i < 15; i++) {
            if (data[i].radiant_win == true && data[i].player_slot < 128 || data[i].radiant_win == false && data[i].player_slot >= 128) {
                winstreak++
            } else {
                break;
            }
        }
        for (var i = 0; i < 15; i++) {
            if (data[i].radiant_win == true && data[i].player_slot >= 128 || data[i].radiant_win == false && data[i].player_slot < 128) {
                losestreak++
            } else {
                break;
            }
        }
        if (winstreak > 0) {
            ctx.reply("Damn bruh, i'm on a " + winstreak + " winstreak.")
        } else {
            ctx.reply("Damn bruh, i'm on a " + losestreak + " losestreak.")
        }
    }),
)

bot.action('Match Details', async (ctx) => {
    fetch(url+'recentMatches').then((res) => res.json()).then((data) => {
        let juayHero = data[0].hero_id
        let juayHeroName
        fetch(heroNamesUrl).then((res) => res.json()).then((data) => {
            let heroArray = data
            juayHeroName = data[juayHero - 1].localized_name
        })
        let juayKills = data[0].kills
        let juayDeaths = data[0].deaths
        let juayAssists = data[0].assists
        ctx.reply("<b>" + juayHeroName + "</b>\n" + "Kills: " + juayKills + "\n"
            + "Deaths: " + juayDeaths + "\n"
            + "Assists: " + juayAssists, {
            parse_mode: 'HTML'
        })
    })
})

bot.action('Bulge', async (ctx) => {
    ctx.replyWithPhoto({ source: 'assets/juaydp.jpg' }, { caption: "Don't be sad, have a bulge." })
})

bot.action('Sentence', async (ctx) => {
    fetch(url+'wordcloud').then((res) => res.json()).then((data) => {
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

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))