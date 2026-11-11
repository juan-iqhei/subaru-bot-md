export default {
  command: 'ping',
  desc: 'Ver velocidad del bot',
  category: 'General',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    await sock.sendMessage(jid, { text: 'pong 🏓' })
  }
}
