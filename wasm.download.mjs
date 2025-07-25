import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import axios from 'axios';
import { Extract } from 'unzipper';



export async function downloadFile(url, outputPath) { 
  const dirname = path.dirname(outputPath)
  if (!fs.existsSync(dirname)) { fs.mkdirSync(dirname, { recursive: true }) }
  const writer = fs.createWriteStream(outputPath);
  const response = await axios({
    url,
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}


export function unzipFile(zipPath, outputDir) {
  fs.createReadStream(zipPath)
    .pipe(Extract({ path: outputDir }))
    .on('close', () => {
      console.log('Arquivo descompactado com sucesso!');
    })
    .on('error', (err) => {
      console.error('Erro ao descompactar o arquivo:', err);
    });
}

export async function download({ url, distDir } = {}) { 
    distDir ||= "./public"
    url ||= 'https://github.com/rafael-vasconcellos/VNTextPatch-net8/releases/download/v1.0.0/VNTextPatch-wasm.zip'
    const zipFileName = url.split('/')[ url.split('/').length - 1 ]
    const outputZipPath = path.resolve('./wasm', zipFileName)

    if (!fs.existsSync(outputZipPath)) { await downloadFile(url, outputZipPath) }
    const folderExists = fs.existsSync('./public/_framework') && fs.readdirSync('./public/_framework').length
    if (!folderExists) { unzipFile(outputZipPath, path.resolve(distDir)) }
}


if (import.meta.url === pathToFileURL(process.argv[1]).href) { download() }