import { bot, db } from "./index.js";

bot.on("message", async (ctx) => {
    if(ctx.hasCommand("ship")) {
        let users = (await db.ref(`chats/${ctx.update.message.chat.id}/members`).get()).val();
        let first_user_id = users[Math.random() * (users.length - 1)]
        let second_user_id = users[Math.random() * (users.length - 1)]
        let first_user = (await db.ref(`users/${first_user_id}`).get()).val()
        let second_user = (await db.ref(`users/${second_user_id}`).get()).val()
        ctx.reply(`💞 РАНДОМ ШИП: [${first_user.fn}](tg://user?id=${first_user_id}) \\+ [${second_user.fn}](tg://user?id=${second_user_id})\\. Любите друг друга и берегите\\. Мур\\.`, {
            "parse_mode": "MarkdownV2"
        })
    };
    db.ref(`users/${ctx.update.message.from.id}`).update({
        "un": ctx.update.message.from.username,
        "fn": ctx.update.message.from.first_name
    });
    db.ref(`chats/${ctx.update.message.chat.id}/members`).transaction(snapshot => {
        let members = snapshot.exists() ? snapshot.val() : [];
        if(!members.includes(ctx.update.message.from.id)) members.push(ctx.update.message.from.id)
        return members;
    });
})
