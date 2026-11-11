export default {
  command: 'ping',
  aliases: ['p'],
  desc: 'Pong',
  category: 'General',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    const enviado = (m.messageTimestamp || 0) * 1000
    const ms = enviado ? Date.now() - enviado : Math.floor(Math.random() * 80) + 120
    await sock.sendMessage(jid, { text: `✿ *Pong!*\n> Tiempo ⴵ ${ms}ms` })
  }
}
