import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OWNER = '5493764847048'

export default {
  command: 'addplugin',
  desc: 'Agregar un plugin nuevo',
  category: 'Dueño',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    const sender = (m.key?.participant || m.key?.remoteJid || '').replace(/[^0-9]/g,'')
    if (!sender.includes(OWNER)) return sock.sendMessage(jid, { text: '❌ Solo el dueño puede usar esto' })
    // Saca el texto de donde venga
    let full = ctx?.text || ctx?.args?.join(' ') || m.message?.conversation || m.message?.extendedTextMessage?.text || ''
    full = full.replace(/^\//, '').replace(/^addplugin\s+/i, '').trim()
    if (!full) return sock.sendMessage(jid, { text: 'Uso: /addplugin nombre.js\n```código```\n\nEjemplo:\n/addplugin hola.js\nexport default {\n command: "hola",\n desc: "Saluda",\n category: "General",\n run: async (sock, m, ctx) => {\n  await sock.sendMessage(m.key.remoteJid, { text: "Hola bro" })\n }\n}' })
    // Quita los ``` si mandó con código
    full = full.replace(/^```(?:js|javascript)?\n?/i, '').replace(/```$/,'').trim()
    const partes = full.split(/\s+/)
    let nombre = partes[0]
    let codigo = full.slice(nombre.length).trim()
    if (!nombre.endsWith('.js')) nombre += '.js'
    if (!codigo) return sock.sendMessage(jid, { text: '❌ Falta el código. Mandá: /addplugin nombre.js + código' })
    const ruta = path.join(__dirname, nombre)
    if (fs.existsSync(ruta)) return sock.sendMessage(jid, { text: `❌ Ya existe ${nombre}. Borralo primero con /delplugin ${nombre}` })
    fs.writeFileSync(ruta, codigo)
    await sock.sendMessage(jid, { text: `✅ Plugin ${nombre} creado.\nAhora mandá /reload para activarlo.` })
  }
}
