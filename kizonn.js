// kizonn.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const yts = require('yt-search');
import {
  botName,
  ownerName,
  ownerNumber,
  getTime,
  mode,
  getDate,
  prefix
} from './kizon/config.js';
import { getBuffer, fetchJson } from './downloader/utils.js';
import { addOwner, removeOwner, getOwners } from './kizon/kizon.js';
import axios from 'axios';
import fetch from 'node-fetch';
import fs from 'fs';
import { getMode, setMode } from './kizon/mode.js';
import stickerHandler from './downloader/stiker.js';
import playHandler from './downloader/play.js';


const profileCache = {}; // Cache foto profil user
const fallbackThumbnail = 'https://i.ibb.co/Yyt6bNf/default-thumbnail.jpg'; // Gambar default
async function getUserProfile(bot, jid) {
  if (profileCache[jid]) return profileCache[jid];
  try {
    const url = await bot.profilePictureUrl(jid, 'image');
    profileCache[jid] = url;
    return url;
  } catch {
    return fallbackThumbnail;
  }
}

export default async function handleMessage(m, bot) {
  const body = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
  if (!body.startsWith(prefix)) return;

if (!bot?.sendMessage || !bot?.user?.id) {
  reply("⏳ Bot belum siap. Silakan coba lagi nanti.");
  return;
}
  const args = body.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();
  const text = args.join(' ');
  const sender = (m.key.participant || m.key.remoteJid || '').split('@')[0];
  const isOwner = ownerNumber.includes(sender);
  const reply = (msg) => bot.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
console.log('=== DEBUG ===');
console.log('body:', body);
console.log('command:', command);
console.log('args:', args);
console.log('sender:', sender);

  switch (command) {
    case 'menu': {
  console.log('Menjalankan menu...');
  
  const nama = m.pushName || 'Tanpa Nama';
  const id = (m.key.participant || m.key.remoteJid || '').split('@')[0];
  const waktu = getTime();
  const tanggal = getDate();
  const menuText = `
👋 Hai *${nama}*!

╭─┴─「 *BOT INFO* 」
├ *Nama Bot* : ${botName}
├ *Owner* : ${ownerName}
├ *Mode* : ${mode.toUpperCase()}
├ *Tanggal* : ${tanggal}
├ *Waktu* : ${waktu}
╰───────────────

📌 Klik tombol di bawah untuk mulai!
`;

  // Ambil foto profil atau fallback
  let profile;
  try {
    profile = await bot.profilePictureUrl(m.sender, 'image');
  } catch {
    profile = 'https://i.ibb.co/Yyt6bNf/default-thumbnail.jpg';
  }

  try {
    await bot.sendMessage(m.chat, {
      text: menuText,
      footer: 'ZyrooBot | Powered by Ukiratmaja Gzz',
      buttons: [
        { buttonId: '.ping', buttonText: { displayText: '📡 Ping' }, type: 1 },
        { buttonId: '.bot', buttonText: { displayText: '🤖 Status' }, type: 1 },
        { buttonId: '.play let it go', buttonText: { displayText: '🎵 Play' }, type: 1 }
      ],
      headerType: 4, // 4 = ExternalAdReply (gambar + link)
      contextInfo: {
        externalAdReply: {
          title: botName,
          body: `Powered by Ukiratmaja Gzz`,
          mediaType: 1,
          previewType: 'PHOTO',
          thumbnailUrl: profile,
          renderLargerThumbnail: true,
          sourceUrl: 'https://github.com/namaprojek' // ganti linkmu di sini
        }
      }
    }, { quoted: m });
  } catch (e) {
    console.error('❌ Gagal kirim menu:', e);
    reply('⚠️ Gagal menampilkan menu.');
  }

  break;
}
  
    case 'ping': {
      reply('🏓 Pong!');
      break;
    }

    case 'tes':
    case 'bot': {
      const uptime = process.uptime();
      const format = (s) => {
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = Math.floor(s % 60);
        return `${h} jam ${m} menit ${sec} detik`;
      };
      reply(`🤖 *Bot aktif selama:* ${format(uptime)}`);
      break;
    }

    case 'mode': {
      if (!isOwner) return reply('❌ Khusus owner.');
      if (text === 'public' || text === 'private') {
        setMode(text);
        reply(`✅ Mode diubah ke *${text.toUpperCase()}*.`);
      } else {
        reply('Gunakan: .mode public / .mode private');
      }
      break;
    }

    case 'addowner': {
      if (!isOwner) return reply('❌ Khusus owner.');
      const number = text.replace(/[^0-9]/g, '');
      if (!number) return reply('❗ Masukkan nomor yang ingin dijadikan owner.');
      addOwner(number);
      reply(`✅ Nomor ${number} sekarang adalah owner.`);
      break;
    }

    case 'delowner': {
      if (!isOwner) return reply('❌ Khusus owner.');
      const number = text.replace(/[^0-9]/g, '');
      if (!number) return reply('❗ Masukkan nomor yang ingin dihapus dari owner.');
      removeOwner(number);
      reply(`❌ Nomor ${number} sudah dihapus dari owner.`);
      break;
    }

    case 'play': {
      await playHandler(m, { text, command, reply, bot });
      break;
    }

    case 'stiker':
    case 'sticker': {
      await stickerHandler(m, { bot });
      break;
    }

    default: {
      reply('❌ Command tidak dikenali.');
    }
  }
}