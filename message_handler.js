import { bot, db } from "./index.js";
import { info } from "./logger.js";

var cooldowns = new Map();
var cooldown_per_user = process.env.cd ? Number(process.env.cd) : 60000 

bot.on("message", async (ctx) => {
    var time = Date.now()
    if(ctx.hasCommand("ship")) {
        var cooldown = cooldowns.get(ctx.message.from.id)
        if (cooldown > time) {
            var message = await ctx.reply(`⏱️ КУЛДАУН: осталось ${Number((cooldown - time) / 1000)}с.`)
            setTimeout(() => bot.api.deleteMessage(message.chat.id, message.message_id), 5000)
            return;
        }
        else if(cooldowns.has(ctx.message.from.id)) cooldowns.delete(ctx.message.from.id);
        cooldowns.set(ctx.message.from.id, Date.now() + cooldown_per_user)
        let users = (await db.ref(`chats/${ctx.update.message.chat.id}/members`).get()).val();
        let ignore_list = (await db.ref(`chats/${ctx.update.message.chat.id}/ignore_list`).get()).val();
        let first_user_id = pick_member(ctx, users, ignore_list);
        let second_user_id = pick_member(ctx, users, ignore_list);
        let first_user = (await db.ref(`users/${first_user_id}`).get()).val()
        let second_user = (await db.ref(`users/${second_user_id}`).get()).val()
        ctx.reply(`💞 РАНДОМ ШИП: <a href="tg://user?id=${first_user_id}">${escape(first_user.fn)}</a> + <a href="tg://user?id=${second_user_id}">${escape(second_user.fn)}</a>. Любите друг друга и берегите. Мур.`, {
            "parse_mode": "HTML"
        })
    } else if (ctx.hasCommand("ignore")) {
        db.ref(`chats/${ctx.update.message.chat.id}/ignore_list`).transaction(async (snapshot) => {
            let ignore_list = snapshot.val() != null ? snapshot.val() : [];
            if (ignore_list.includes(ctx.message.from.id)) {
                ignore_list.splice(ignore_list.indexOf(ctx.message.from.id), 1);
                ctx.reply("📛 ИГНОРИРОВАНИЕ: Теперь вы снова участвуете в пейрингах");
            } else {
                ignore_list.push(ctx.message.from.id);
                ctx.reply("📛 ИГНОРИРОВАНИЕ: Теперь вы больше не участвуете в пейрингах");
            }
            return ignore_list;
        })
    }
    if(ctx.update.message.from.username == 'GroupAnonymousBot') return;
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

function pick_member(ctx, users, ignore_list) {
    let member
    let attempts = 0;
    do {
        attempts++;
        member = users[Math.round(Math.random() * (users.length - 1))]
    } while (ignore_list != null && ignore_list.includes(member) && attempts < 5)
    if(attempts >= 5) {
        member = ctx.message.from.id;
        info(`не удалось подобрать пользователя для шипа (${ctx.chat.id})`)
    }
    return member;
}

function escape(string) {
    return string.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&/g, "&amp;")
}