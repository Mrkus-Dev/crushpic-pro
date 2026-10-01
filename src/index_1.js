const core = require('@actions/core');
const glob = require('@actions/glob');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function checkProLicense() {
  // Cek via GitHub Marketplace API - untuk demo cek ENV
  // Real: panggil https://api.github.com/marketplace_listing/accounts/{ownerId}
  const proKey = core.getInput('pro-key');
  if (proKey && proKey.startsWith('pro_')) return true;
  // Jika di-install dari Marketplace dengan plan berbayar, GitHub akan set secret otomatis
  // Kita cek env GITHUB_MARKETPLACE_PLAN
  if (process.env.GITHUB_MARKETPLACE_PLAN && process.env.GITHUB_MARKETPLACE_PLAN !== 'free') return true;
  // Fallback untuk testing: jika ada file .pro di repo = Pro
  return fs.existsSync('.pro-license');
}

async function run() {
  try {
    const pattern = core.getInput('path') || './images';
    const quality = parseInt(core.getInput('quality') || '80');
    const convertWebp = core.getInput('convert-webp') === 'true';
    const convertAvif = core.getInput('avif') === 'true';
    
    const isPro = await checkProLicense();
    console.log(isPro ? '🔥 Mode PRO aktif - Unlimited' : '🆓 Mode FREE - Limit 100 images');

    if (!isPro && (convertWebp || convertAvif)) {
      core.setFailed('Fitur WebP/AVIF hanya untuk Pro. Upgrade di GitHub Marketplace: $15/mo');
      return;
    }

    const globber = await glob.create(`${pattern}/**/*.{jpg,jpeg,png,webp}`, { followSymbolicLinks: false });
    const files = await globber.glob();
    
    if (!isPro && files.length > 100) {
      core.setFailed(`Free limit 100 images, kamu punya ${files.length}. Upgrade ke Pro untuk unlimited. https://github.com/marketplace/actions/crushpic-pro`);
      return;
    }

    let totalSaved = 0;
    let count = 0;

    for (const file of files.slice(0, isPro ? files.length : 100)) {
      const originalSize = fs.statSync(file).size;
      const ext = path.extname(file).toLowerCase();
      let pipeline = sharp(file);
      
      if (ext === '.jpg' || ext === '.jpeg') {
        pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      } else if (ext === '.png') {
        pipeline = pipeline.png({ quality, compressionLevel: 9 });
      } else if (ext === '.webp') {
        pipeline = pipeline.webp({ quality });
      }

      const buffer = await pipeline.toBuffer();
      if (convertWebp && isPro) {
        const webpPath = file.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        await sharp(buffer).webp({ quality }).toFile(webpPath);
      }
      
      fs.writeFileSync(file, buffer);
      const newSize = buffer.length;
      totalSaved += (originalSize - newSize);
      count++;
      console.log(`✅ ${path.basename(file)}: ${originalSize} -> ${newSize} (saved ${originalSize - newSize})`);
    }

    core.setOutput('compressed-count', count);
    core.setOutput('saved-bytes', totalSaved);
    core.summary.addHeading('CrushPic Pro Result').addTable([
      [{data: 'Status', header: true}, {data: isPro ? 'PRO' : 'FREE', header: true}],
      ['Compressed', `${count} images`],
      ['Saved', `${(totalSaved/1024).toFixed(2)} KB`],
      ['Quality', `${quality}%`]
    ]).write();

    console.log(`🎉 Selesai! ${count} gambar, hemat ${(totalSaved/1024/1024).toFixed(2)} MB`);
    
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
