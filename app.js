import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import moment from 'moment'
import { Markup } from 'telegraf'
import nodeCron from 'node-cron'

//VARIABLES
let url = 'https://api.opendota.com/api/players/110236540/'
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)
// let task = undefined
let taskNow
let juayHeroName
let task = nodeCron.schedule('0 30 17 * * *', () => {
    ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
    ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
    bot.telegram.sendVideoNote(ctx.message.chat.id, { source: `assets/alarm.mp4` })
}, {
    scheduled: false,
    timezone: "Asia/Singapore"
})
task.start()
bot.use(async (ctx) => {
    console.log(`${ctx.message.chat.id}`)
    return next()
})

//FUNCTIONS
function binarySearch(sortedArray, key) {
    let start = 0
    let end = sortedArray.length - 1
    while (start <= end) {
        let middle = Math.floor((start + end) / 2)
        if (sortedArray[middle].id === key) {
            juayHeroName = (sortedArray[middle].localized_name)
            break
        } else if (sortedArray[middle].id < key) {
            start = middle + 1
        } else {
            end = middle - 1
        }
    }
    return;
}

//BOT COMMANDS
bot.command('/alarmNow', (ctx) => {
    if (!taskNow) {
        ctx.reply('Game Alarm every 10 seconds has been turned on.')
        taskNow = nodeCron.schedule('*/10 * * * * *', () => {
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
        }, {
            scheduled: false,
            timezone: "Asia/Singapore"
        })
        taskNow.start()
    } else {
        taskNow.stop()
        taskNow = undefined
        ctx.reply('Game Alarm has been turned off.')
    }

})

bot.command('/alarmOn', (ctx) => {
    if (!task) {
        task = nodeCron.schedule('0 30 17 * * *', () => {
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            ctx.reply('🚨ATTENTION !!!!!!!!!!!!! 来骚 LAI SAO LIANG QUAN 两圈 !!!!!!!!!!!!!🚨')
            // ctx.replyWithVoice({ source: `assets/alarm.ogg` })
            bot.telegram.sendVideoNote(ctx.message.chat.id, { source: `assets/alarm.mp4` })
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
    fetch(url + 'recentMatches').then((res) => res.json()).then((data) => {
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
    let juayHero
    let juayKills
    let juayDeaths
    let juayAssists
    await fetch(url + 'recentMatches').then((res) => res.json()).then((data) => {
        juayHero = data[0].hero_id
        juayKills = data[0].kills
        juayDeaths = data[0].deaths
        juayAssists = data[0].assists
    })
    await fetch('https://api.opendota.com/api/heroes').then((res) => res.json()).then((data) => {
        binarySearch(data, juayHero)
    })
    ctx.reply("<b>" + juayHeroName + "</b> \n" + "Kills: " + juayKills + "\n"
        + "Deaths: " + juayDeaths + "\n"
        + "Assists: " + juayAssists, {
        parse_mode: 'HTML'
    })
})

bot.action('Bulge', async (ctx) => {
    ctx.replyWithPhoto({ source: 'assets/juaydp.jpg' }, { caption: "Don't be sad, have a bulge." })
})

bot.action('Sentence', async (ctx) => {
    fetch(url + 'wordcloud').then((res) => res.json()).then((data) => {
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