import yts from 'yt-search';
import axios from 'axios';
import fetch from 'node-fetch';

const getBuffer = async (url) => {
  const res = await fetch(url);
  return await res.buffer();
};
const fetchJson = async (url, opt) => {
  const res = await fetch(url, opt);
  return await res.json();
};

const playHandler = async (m, { text, command, reply, bot }) => {
  try {
    if (!text) return reply(`Masukkan juga judul lagu, contoh *${command} lucid dreams*`);
    const jid = m.key.remoteJid;
    if (!jid) return reply("⚠️ JID tidak valid (pesan tidak dapat dikirim).");

    await bot.sendMessage(jid, { react: { text: "⏱️", key: m.key } });

    const rus = await yts(text);
    const data = rus.all.filter(v => v.type === 'video');
    if (data.length === 0) return reply("Tidak ada video yang ditemukan.");

    const res = data[0];
    const thumbUrl = `https://i.ytimg.com/vi/${res.videoId}/hqdefault.jpg`;
    const inithumb = await getBuffer(thumbUrl);

    const teks = `*PLAYING MUSIC FROM YOUTUBE*\n\n` +
      `📺 *Channel* : ${res.author.name}\n` +
      `👀 *Views* : ${res.views} kali\n` +
      `⏱️ *Duration* : ${res.timestamp}\n` +
      `🔗 *URL* : ${res.url}\n\nMengirim audio...`;

    await bot.sendMessage(jid, {
      contextInfo: {
        externalAdReply: {
          showAdAttribution: true,
          title: res.title,
          body: new Date().toLocaleString(),
          mediaType: 2,
          renderLargerThumbnail: true,
          thumbnail: inithumb,
          mediaUrl: res.url,
          sourceUrl: res.url
        }
      },
      image: { url: thumbUrl },
      text: teks
    }, { quoted: m });

    const mbut = await fetchJson(`https://ochinpo-helper.hf.space/yt?query=${text}`);
    const crot = mbut.result.download.audio;

    const nt = await bot.sendMessage(jid, {
      audio: { url: crot },
      mimetype: 'audio/mpeg',
      ptt: true
    }, { quoted: m });

    await bot.sendMessage(jid, { react: { text: '🎶', key: nt.key } });

  } catch (err) {
    console.error(err);
    reply(`❌ Terjadi kesalahan: ${err.message}`);
  }
};

export default playHandler;