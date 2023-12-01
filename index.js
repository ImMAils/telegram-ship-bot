import { Bot } from "grammy"
(await import("dotenv")).config()

export const bot = new Bot(process.env.TOKEN);

import("./message_handler.js");

bot.catch((err) => console.error(err))
bot.start();