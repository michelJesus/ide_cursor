const util = require("util")
const sharp = require("sharp")

/* sharp("*.jpeg")
    .resize(1200)
    .jpeg({ mozjpeg: true })
    .toFile("*.jpg") */

const fs = require('fs').promises;

const compress = async () => {

  const directory = await fs.readdir("./original/");

  const pattern = new RegExp('^.*\\.(jpg|JPG|jpeg|JPEG|gif|GIF|png|PNG)$');

  const files = directory.filter(file => pattern.test(file));

  if (files.length > 0) {
    await Promise.all(
      files.map(async file => {
        const content = await fs.readFile(`./original/${file}`);
        const compressContent = await sharp(content)
          .resize(600)
          .jpeg({ mozjpeg: true })
          .toFormat('jpeg', {
            progressive: true,
            quality: 90,
          })
          .toBuffer();

        await fs.writeFile(
          `./reduce/${file}`,
          compressContent
        );
      })
    );
  }
};

compress();