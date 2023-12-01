import { bot, db } from "./index.js";

bot.on("message", (ctx) => {
    if(ctx.hasCommand("ship")) return ctx.reply("bruh")
    db.
    console.log(ctx.update.message)
})
