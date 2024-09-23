import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import ora from 'ora';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcVideoDir = path.join(__dirname, '../src/assets/video');
const distVideoDir = path.join(__dirname, '../dist/assets/video');

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertVideo(filePath) {
  const fileName = path.basename(filePath);
  const outputFilePath = path.join(distVideoDir, fileName);
  await fs.ensureDir(path.dirname(outputFilePath));

  const spinner = ora(`Converting ${fileName} to .mp4`).start();

  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .outputOptions([
        '-vf', 'scale=640:-2', // Dimensiona o vídeo para 640px de largura, mantendo a proporção
        '-c:v', 'libx264', // Codec de vídeo
        '-crf', '28', // Aumenta a taxa de compressão (valores mais altos resultam em menor qualidade e menor tamanho de arquivo)
      ])
      .toFormat('mp4')
      .on('progress', (progress) => {
        if (progress.percent) {
          spinner.text = `Converting ${fileName}: ${progress.percent.toFixed(2)}% done`;
        }
      })
      .on('end', async () => {
        spinner.succeed(`Conversion complete: ${fileName}`);
        // Verifica se o arquivo foi realmente compactado
        const originalSize = (await fs.stat(filePath)).size;
        const newSize = (await fs.stat(outputFilePath)).size;
        console.log(`Original size: ${originalSize} bytes, New size: ${newSize} bytes`);
        resolve(outputFilePath);
      })
      .on('error', (err) => {
        spinner.fail(`Conversion failed: ${fileName}`);
        reject(err);
      })
      .save(outputFilePath);
  });
}

async function processVideos() {
  const files = await glob(path.join(srcVideoDir, '*.mp4'));
  for (const file of files) {
    await convertVideo(file);
  }
}

processVideos()
  .then(() => console.log('Video processing complete'))
  .catch(err => console.error('Error processing videos:', err));
