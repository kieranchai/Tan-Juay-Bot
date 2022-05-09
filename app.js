import { Telegraf } from 'telegraf'
import fetch from 'node-fetch'

const BOT_TOKEN = '5372911011:AAHk0VeTdplzPNElB6avZhQj1BJcXNFitcY';
const bot = new Telegraf(BOT_TOKEN)
let url = 'https://api.opendota.com/api/players/110236540/recentMatches'

//BOT COMMANDS
bot.start((ctx) => ctx.reply('Welcome'))

bot.hears('juay', async (ctx) =>
    fetch(url).then((res) => res.json()).then((data) => {
        let juayResult;
        let matchDt = new Date(data[0].start_time * 1000);
        if (data[0].radiant_win == true && data[0].player_slot < 128) {
            juayResult = "won.";
        } else if (data[0].radiant_win == true && data[0].player_slot >= 128) {
            juayResult = "lost.";
        } else if (data[0].radiant_win == false && data[0].player_slot < 128) {
            juayResult = "lost.";
        } else if (data[0].radiant_win == false && data[0].player_slot >= 128) {
            juayResult = "won.";
        };
        ctx.reply("Juay's last match was on " + matchDt +", and he " + juayResult);
    })
);

bot.launch()