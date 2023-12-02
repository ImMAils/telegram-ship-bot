import { bot, db } from "./index.js";

bot.on("message", async (ctx) => {
    if(ctx.hasCommand("ship")) {
        let users = (await db.ref(`chats/${ctx.update.message.chat.id}/members`).get()).val();
        let first_user_id = users[Math.round(Math.random() * (users.length - 1))]
        let second_user_id = users[Math.round(Math.random() * (users.length - 1))]
        console.log("selected ids: ", [first_user_id, second_user_id])
        let first_user = (await db.ref(`users/${first_user_id}`).get()).val()
        let second_user = (await db.ref(`users/${second_user_id}`).get()).val()
        console.log("selected users: ", [first_user, second_user])
        ctx.reply(`💞 РАНДОМ ШИП: <a href="tg://user?id=${first_user_id}">${escape(first_user.fn)}</a> + <a href="tg://user?id=${second_user_id}">${escape(second_user.fn)}</a>. Любите друг друга и берегите. Мур.`, {
            "parse_mode": "HTML"
        })
    }
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

function escape(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")
}