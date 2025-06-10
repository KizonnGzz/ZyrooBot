console.debug = () => {}; // 🔇 Redam log Baileys

import { makeWASocket, useMultiFileAuthState } from '@whiskeysockets/baileys';
import pino from 'pino';
import fs from 'fs';
import handleMessage from './kizonn.js';
import * as config from './kizon/config.js';

(async function start(usePairingCode = true) {
  const session = await useMultiFileAuthState('session');
  global.botStartTime = Date.now();

  const kizon = makeWASocket({
    printQRInTerminal: !usePairingCode,
    auth: session.state,
    logger: pino({ level: 'silent' }).child({ level: 'silent' })
  });
  global.isBotReady = false; // awalnya false

  // ✅ Simpan nomor bot (untuk deteksi self-chat)
  global.botNumber = kizon.user.id.split(':')[0];

  // ✅ QR Pairing jika belum terhubung
  if (usePairingCode && !kizon.user && !kizon.authState.creds.registered) {
    const rl = await import('readline');
    const rlInterface = rl.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (text) => new Promise(res => rlInterface.question(text, res));
    const waNumber = await question("Masukkan nomor WhatsApp Anda: +");
    const code = await kizon.requestPairingCode(waNumber.replace(/\D/g, ""));
    console.log(`\x1b[44;1m\x20PAIRING CODE\x20\x1b[0m\x20${code}`);
    rlInterface.close();
  }

  // ✅ Pesan Masuk
  kizon.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0];
    if (!m.message) return;

    // ✅ Izinkan pesan dari bot sendiri
    const senderJid = m.key.participant || m.key.remoteJid || '';
    const senderNum = senderJid.split('@')[0];
    const isFromBot = senderNum === global.botNumber;

    // ✅ Auto-read
    await kizon.readMessages([m.key]);

    // ✅ Handle command
    await handleMessage(m, kizon);
  });

  // ✅ Koneksi
  kizon.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
  if (connection === "open") {
    console.log("✅ Terhubung dengan:", kizon.user.id.split(':')[0]);
    global.isBotReady = true;
  }
  if (connection === "close") {
    global.isBotReady = false;
    const code = lastDisconnect?.error?.output?.statusCode;
    if (code === 401) {
      await fs.promises.rm("session", { recursive: true, force: true });
    }
    return start();
  }
});

  // ✅ Simpan sesi otomatis
  kizon.ev.on("creds.update", session.saveCreds);
})();