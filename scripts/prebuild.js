import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { glob } from 'glob';
import fs from 'fs-extra';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';
import compressPdf from 'compress-pdf';

const execAsync = promisify(exec);

async function convertEpsToJpg() {
  try {
    console.log('Converting .eps files to .jpg...');

    const srcImageDir = './src/assets/image';
    const distImageDir = './dist/assets/image';

    // Verifica se a pasta de origem existe
    const srcImageDirExists = await fs.pathExists(srcImageDir);
    if (!srcImageDirExists) {
      console.log(`Source image directory ${srcImageDir} does not exist.`);
      return;
    }

    // Certifique-se de que a pasta de destino existe
    await fs.ensureDir(distImageDir);

    const epsFiles = await glob.sync(`${srcImageDir}/*.eps`);

    if (epsFiles.length === 0) {
      console.log('No .eps files found in src/assets/image/');
      return;
    }

    await Promise.all(
      epsFiles.map(async file => {
        const fileName = path.basename(file, '.eps');
        const outputFilePath = path.join(distImageDir, `${fileName}.jpg`);

        // Comando ImageMagick para converter .eps para .jpg
        const command = `magick convert "${file}" -density 150 "${outputFilePath}"`;

        console.log(`Converting ${file} to ${outputFilePath}`);
        const { stdout, stderr } = await execAsync(command);
        console.log('Command output:', stdout);
        if (stderr) {
          console.error('Command error output:', stderr);
        }
      })
    );

    console.log('.eps to .jpg conversion completed successfully.');
  } catch (error) {
    console.error('Error converting .eps files:', error);
  }
}

async function compressImages() {
  try {
    console.log('Compressing images...');

    const srcImageDir = './src/assets/image';
    const distImageDir = './dist/assets/image';

    // Verifica se a pasta de origem existe
    const srcImageDirExists = await fs.pathExists(srcImageDir);
    if (!srcImageDirExists) {
      console.log(`Source image directory ${srcImageDir} does not exist.`);
      return;
    }

    // Certifique-se de que a pasta de destino existe
    await fs.ensureDir(distImageDir);

    const directory = await fs.readdir(srcImageDir);
    const pattern = new RegExp('^.*\\.(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG|ogg|OGG)$');
    const files = directory.filter(file => pattern.test(file));

    if (files.length === 0) {
      console.log('No image files found in src/assets/image/');
      return;
    }

    await Promise.all(
      files.map(async file => {
        const content = await fs.readFile(path.join(srcImageDir, file));
        const compressContent = await sharp(content)
          .resize(600)
          .jpeg({ mozjpeg: true })
          .toFormat('jpeg', {
            progressive: true,
            quality: 90,
          })
          .toBuffer();

        await fs.writeFile(path.join(distImageDir, file), compressContent);
      })
    );

    console.log('Image compression completed successfully.');
  } catch (error) {
    console.error('Error compressing images:', error);
  }
}

async function compressVideos() {
  try {
    console.log('Compressing videos...');

    const distVideoDir = './dist/assets/video';

    // Esvazia a pasta dist/assets/video
    await fs.emptyDir(distVideoDir);
    console.log(`Emptied ${distVideoDir}`);

    // Encontra todos os arquivos de vídeo na pasta src/assets/video
    const files = await glob.sync('./src/assets/video/*.{mp4,avi,mov,mkv,ogg}');

    if (files.length === 0) {
      console.log('No video files found in src/assets/video/');
      return;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      const fileName = path.basename(file, ext);
      const outputFileName = `${fileName}_reduced.mp4`;
      const outputFilePath = path.join(distVideoDir, outputFileName);

      // Certifique-se de que a pasta de destino existe
      await fs.ensureDir(path.dirname(outputFilePath));

      // Comando ffmpeg para converter e compactar o vídeo
      const command = `"${ffmpegPath}" -i "${file}" -vf scale=640:-2 -vcodec libx264 -crf 28 "${outputFilePath}"`;

      console.log(`Converting ${file} to ${outputFilePath}`);
      const { stdout, stderr } = await execAsync(command);
      console.log('Command output:', stdout);
      if (stderr) {
        console.error('Command error output:', stderr);
      }
    }

    console.log('Video compression completed successfully.');
  } catch (error) {
    console.error('Error compressing videos:', error);
  }
}

async function compressPdfs() {
  try {
    console.log('Compressing PDFs...');

    const srcPdfDir = './src/assets/pdf';
    const distPdfDir = './dist/assets/pdf';

    // Verifica se a pasta de origem existe
    const srcPdfDirExists = await fs.pathExists(srcPdfDir);
    if (!srcPdfDirExists) {
      console.log(`Source PDF directory ${srcPdfDir} does not exist.`);
      return;
    }

    // Certifique-se de que a pasta de destino existe
    await fs.ensureDir(distPdfDir);

    const pdfFiles = await glob.sync(`${srcPdfDir}/*.pdf`);

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in src/assets/pdf/');
      return;
    }

    await Promise.all(
      pdfFiles.map(async file => {
        const fileName = path.basename(file);
        const outputFilePath = path.join(distPdfDir, fileName);

        // Comando para compactar PDF
        const command = `magick convert "${file}" -density 150 "${outputFilePath}"`;

        console.log(`Compressing ${file} to ${outputFilePath}`);
        const { stdout, stderr } = await execAsync(command);
        console.log('Command output:', stdout);
        if (stderr) {
          console.error('Command error output:', stderr);
        }
      })
    );

    console.log('PDF compression completed successfully.');
  } catch (error) {
    console.error('Error compressing PDFs:', error);
  }
}

async function runCommands() {
  try {
    console.log('Running prebuild commands...');

    await convertEpsToJpg();
    await compressImages();
    await compressVideos();
    await compressPdfs();

    console.log('Prebuild commands completed successfully.');
  } catch (error) {
    console.error('Error running prebuild commands:', error);
  }
}

runCommands();
