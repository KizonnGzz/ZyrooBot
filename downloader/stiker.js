import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { writeFileSync, unlinkSync } from 'fs';
import { spawn } from 'child_process';

const stickerHandler = async (m, { bot }) => {
  const msg = m.message;
  const quotedMsg = msg?.extendedTextMessage?.contextInfo?.quotedMessage;

  if (!quotedMsg?.imageMessage) {
    return bot.sendMessage(m.key.remoteJid, { text: '❗Reply gambar dengan perintah .stiker' }, { quoted: m });
  }

  // ✅ Download media
  const mediaBuffer = await downloadMediaMessage(
    { message: quotedMsg },  // HARUS dibungkus jadi { message: ... }
    'buffer',
    {}
  );

  const inputPath = `./temp/${Date.now()}.jpg`;
  const outputPath = inputPath.replace('.jpg', '.webp');
  writeFileSync(inputPath, mediaBuffer);

  // 🔄 Konversi ke stiker via ffmpeg
  await new Promise((resolve, reject) => {
    spawn('ffmpeg', [
      '-i', inputPath,
      '-vcodec', 'libwebp',
      '-vf', 'scale=512:512:force_original_aspect_ratio=increase,crop=512:512',
      '-lossless', '1',
      '-compression_level', '6',
      '-qscale', '75',
      '-preset', 'picture',
      '-an', '-vsync', '0',
      outputPath
    ])
      .on('close', resolve)
      .on('error', reject);
  });

  // ✅ Kirim stiker
  await bot.sendMessage(m.key.remoteJid, {
    sticker: { url: outputPath }
  }, { quoted: m });

  // 🧹 Bersihkan file
  unlinkSync(inputPath);
  unlinkSync(outputPath);
};

export default stickerHandler;