export default {
  command: 'help',
  desc: 'Ver ayuda',
  category: 'General',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    await sock.sendMessage(jid, { text: 'Usa /menu para ver el menú' })
  }
}
