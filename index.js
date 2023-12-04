import { Bot } from "grammy"
import { AceBase } from "acebase"
(await import("dotenv")).config()

export const bot = new Bot(process.env.TOKEN);
export const db = new AceBase("db", {
    "logLevel": "warn",
    "storage": {
        "removeVoidProperties": true,
    }
})

import("./message_handler.js");

bot.catch((error) => console.error(error))

bot.start();