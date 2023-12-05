export function info(...text) {
    let date = new Date();
    console.log(`[${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}] ${text.join("")}`)
}