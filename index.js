import { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NUMERO = '5493764847048'
const PREFIX = '/'
const plugins = new Map()

async function loadPlugins() {
  plugins.clear()
  const dir = path.join(__dirname, 'plugins')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir)
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'))
  for (const file of files) {
    try {
      const mod = await import(`./plugins/${file}?update=${Date.now()}`)
      const p = mod.default
      if (p && p.command) {
        plugins.set(p.command, p)
        console.log(`✅ Plugin cargado: ${p.command} - ${p.desc}`)
      }
    } catch(e){ console.log('Error plugin', file, e.message) }
  }
}

function getMenu() {
  let menu = `*SUBARU-BOT-MD*\n`
  menu += `━━━━━━━━━━━━━━━\n`
  menu += `👤 Dueño: 5493764847048\n`
  menu += `Plugins: ${plugins.size}\n`
  menu += `⚡ Prefix: ${PREFIX}\n`
  menu += `━━━━━━━━━━━━━━━\n\n`
  const cats = {}
  for (const p of plugins.values()) {
    const c = p.categoria || 'GENERAL'
    if (!cats[c]) cats[c] = []
    cats[c].push(p)
  }
  for (const c in cats) {
    menu += `*${c}*\n`
    for (const p of cats[c]) {
      menu += `› ${PREFIX}${p.command} - ${p.desc}\n`
    }
    menu += `\n`
  }
  menu += `━━━━━━━━━━━━━━━\n> Subaru Bot MD by vos`
  return menu
}

async function start() {
  await loadPlugins()
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({ version, auth: state, logger: pino({ level: 'silent' }), printQRInTerminal: false, browser: ['Ubuntu', 'Chrome', '20.0.04'] })
  sock.ev.on('creds.update', saveCreds)
  if (!sock.authState.creds.registered) {
    setTimeout(async () => {
      const code = await sock.requestPairingCode(NUMERO)
      console.log('\nTU CODIGO ES: ' + code)
    }, 3000)
  }
  sock.ev.on('connection.update', async (u) => {
    if (u.connection === 'open') console.log('✅ SUBARU-BOT-MD CONECTADO')
    if (u.connection === 'close' && u.lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start()
  })
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return
    const jid = m.key.remoteJid
    const text = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || ''
    if (!text.startsWith(PREFIX)) return
    const [cmdName, ...args] = text.slice(1).trim().split(' ')
    const cmd = cmdName.toLowerCase()

    if (cmd === 'menu') {
      const menuText = getMenu()
      const videoPath = path.join(__dirname, 'subaru_gif.mp4')
      if (fs.existsSync(videoPath)) {
        await sock.sendMessage(jid, { video: fs.readFileSync(videoPath), mimetype: 'video/mp4', gifPlayback: true, caption: menuText })
      } else {
        await sock.sendMessage(jid, { text: menuText })
      }
      return
    }
    if (cmd === 'reload') {
      await loadPlugins()
      await sock.sendMessage(jid, { text: `♻️ Plugins recargados: ${plugins.size} comandos` })
      return
    }
    const plugin = plugins.get(cmd)
    if (plugin) {
      try { await plugin.run(sock, m, { args, text, jid, prefix: PREFIX }) }
      catch(e){ await sock.sendMessage(jid, { text: '❌ Error: ' + e.message }) }
    }
  })
}
start()
