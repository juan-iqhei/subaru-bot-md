export default {
  command: 'quien',
  desc: 'Ver mi id',
  category: 'General',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    const sender = m.key?.participant || m.key?.remoteJid || ''
    const texto = `remoteJid: ${m.key?.remoteJid}\nparticipant: ${m.key?.participant}\nfromMe: ${m.key?.fromMe}\n pushName: ${m.pushName}`
    await sock.sendMessage(jid, { text: texto })
  }
}
