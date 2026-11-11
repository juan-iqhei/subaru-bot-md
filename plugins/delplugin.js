import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OWNERS = ['5493765065759', '127900586106939']

export default {
  command: 'delplugin',
  desc: 'Borrar un plugin',
  category: 'Dueño',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    const sender = (m.key?.participant || m.key?.remoteJid || '').replace(/[^0-9]/g,'')
    if (!(OWNERS.some(o => sender === o || sender.includes(o) || sender.slice(-10) === o.slice(-10)))) return sock.sendMessage(jid, { text: '❌ Solo el dueño puede usar esto' })
    let nombre = ctx?.text || ctx?.args?.join(' ') || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    nombre = nombre.replace(/^\//, '').replace(/^delplugin\s+/i, '').trim().split(/\s+/)[0]
    if (!nombre) return sock.sendMessage(jid, { text: 'Uso: /delplugin nombre.js\n\nEjemplo: /delplugin hola.js' })
    if (!nombre.endsWith('.js')) nombre += '.js'
    if (['addplugin.js','delplugin.js','ping.js'].includes(nombre)) return sock.sendMessage(jid, { text: '❌ No podés borrar ese, es del sistema' })
    const ruta = path.join(__dirname, nombre)
    if (!fs.existsSync(ruta)) return sock.sendMessage(jid, { text: `❌ No existe ${nombre}` })
    fs.unlinkSync(ruta)
    await sock.sendMessage(jid, { text: `✅ Plugin ${nombre} borrado.\nAhora mandá /reload para aplicar.` })
  }
}
