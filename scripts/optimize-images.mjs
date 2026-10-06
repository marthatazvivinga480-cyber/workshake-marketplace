import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const sourceDir = path.join(process.cwd(), 'public', 'images', 'source')
const outputDir = path.join(process.cwd(), 'public', 'images', 'optimized')
fs.mkdirSync(outputDir, { recursive: true })
const files = fs.readdirSync(sourceDir).filter((name) => /\.(png|jpe?g)$/i.test(name))
if (!files.length) {
  console.log('No JPG/PNG source images found in public/images/source.')
  process.exit(0)
}
for (const file of files) {
  const input = path.join(sourceDir, file)
  const base = path.basename(file, path.extname(file)).replace(/[^a-z0-9-_]+/gi, '-').toLowerCase()
  await sharp(input).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outputDir, `${base}.webp`))
  await sharp(input).rotate().resize({ width: 1800, withoutEnlargement: true }).avif({ quality: 58 }).toFile(path.join(outputDir, `${base}.avif`))
  console.log(`Optimized ${file}`)
}
