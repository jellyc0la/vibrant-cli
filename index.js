const path = require('path')
const fs = require('fs')
const yargs = require('yargs')
const { createCanvas } = require('canvas')
const Vibrant = require('node-vibrant')

function uniq(arr) {
  return [...new Set(arr)]
}

function rgbToHex(rgb) {
  const [r, g, b] = rgb
  const hex = r | (g << 8) | (b << 16) | (1 << 24)
  return `#${hex.toString(16).slice(1)}`
}

async function main() {
  const { argv } = yargs
    .usage('Usage: $0 image')
    .default('cw', 900)
    .default('ch', 300)
    .demand(1)
  const file = argv._.pop()

  try {
    const vibrant = new Vibrant(file, { quality: 0 })
    const palette = await vibrant.getPalette()
    const swatches = uniq(Object.values(palette).map(sw => sw._rgb))

    const cwidth = argv.cw
    const cheight = argv.ch
    const swidth = cwidth / swatches.length

    const canvas = createCanvas(cwidth, cheight)
    const ctx = canvas.getContext('2d')

    swatches.forEach((rgb, idx) => {
      console.log(rgbToHex(rgb))
      ctx.fillStyle = `rgb(${rgb.join(',')})`
      ctx.fillRect(swidth * idx, 0, swidth, cwidth)
    })

    const filename = `${path.basename(file, path.extname(file))}-swatch.png`
    const outfile = fs.createWriteStream(filename)

    const stream = canvas.createPNGStream()
    stream.pipe(outfile)
    outfile.on('finish', () => {})
  } catch (err) {
    process.exit(1)
  }
}

main()
