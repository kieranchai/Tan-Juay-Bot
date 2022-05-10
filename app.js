import dotenv from 'dotenv'
dotenv.config()
import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'
import moment from 'moment'
import * as fs from 'fs'
import axios from 'axios'

const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN)
let url = 'https://api.opendota.com/api/players/110236540/recentMatches'
let wordurl = 'https://api.opendota.com/api/players/110236540/wordcloud'

//BOT COMMANDS
bot.start((ctx) => {
    let userFirstName = ctx.message.from.first_name
    let message = `Hello master ${userFirstName}, I am Tan Juay Hee your humble servant.`
    ctx.reply(message)
})

bot.on('photo', async (ctx) => {
    // const model = new TeachableMachine({
    //     modelUrl: "https://teachablemachine.withgoogle.com/models/VfU4viXn8/"
    // })
    const fileId = ctx.update.message.photo[0].file_id;
    ctx.reply('I have received the image please give me a moment.')
    const res = await fetch(
        `https://api.telegram.org/bot${process.env.TELEGRAM_API_TOKEN}/getFile?file_id=${fileId}`
    )
    const res2 = await res.json()
    const filePath = res2.result.file_path
    const downloadURL = `https://api.telegram.org/file/bot${process.env.TELEGRAM_API_TOKEN}/${filePath}`;
    const path1 = `images/${fileId}.jpg`
    ctx.telegram.getFileLink(fileId).then(downloadUrl => {
        axios({ url: downloadUrl.href, responseType: 'stream' }).then(response => {
            return new Promise((resolve, reject) => {
                response.data.pipe(fs.createWriteStream(path1))
                    .on('finish', () => {
                        // model.classify({
                        //     imageUrl: path1,
                        // }).then((predictions) => {
                        //     console.log(predictions)
                        // }).catch((e) => {
                        //     console.log("ERROR", e);
                        // })
                    })
                    .on('error', e => { })
            });
        })
    })
})

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
        }
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