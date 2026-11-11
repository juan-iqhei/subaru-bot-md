import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  command: 'listplugin',
  desc: 'Ver todos los plugins instalados',
  category: 'Dueño',
  run: async (sock, m, ctx) => {
    const jid = m.key?.remoteJid || ctx?.jid
    const archivos = fs.readdirSync(__dirname).filter(f => f.endsWith('.js')).sort()
    if (!archivos.length) return sock.sendMessage(jid, { text: 'No hay plugins instalados' })
    let texto = `*PLUGINS INSTALADOS (${archivos.length})*\n`
    texto += `━━━━━━━━━━━━━━━\n\n`
    for (const file of archivos) {
      try {
        const contenido = fs.readFileSync(path.join(__dirname, file), 'utf8')
        const cmd = (contenido.match(/command:\s*['"]([^'"]+)['"]/) || [])[1] || file.replace('.js','')
        const desc = (contenido.match(/desc:\s*['"]([^'"]+)['"]/) || [])[1] || 'Sin descripción'
        const size = (fs.statSync(path.join(__dirname, file)).size / 1024).toFixed(1)
        texto += `📄 *${file}*\n`
        texto += `├ Comando: /${cmd}\n`
        texto += `├ Desc: ${desc}\n`
        texto += `└ Peso: ${size} KB\n\n`
      } catch {
        texto += `📄 *${file}*\n└ Error al leer\n\n`
      }
    }
    texto += `━━━━━━━━━━━━━━━\n`
    texto += `Para agregar: /addplugin nombre.js + código\n`
    texto += `Para borrar: /delplugin nombre.js`
    await sock.sendMessage(jid, { text: texto })
  }
}
