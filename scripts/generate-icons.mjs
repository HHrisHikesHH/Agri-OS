import sharp from "sharp"

const SVG = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#15803d"/>
  <text x="256" y="360" font-size="300" text-anchor="middle" font-family="serif">🌾</text>
</svg>
`)

const sizes = [72, 96, 128, 192, 512]

for (const size of sizes) {
  await sharp(SVG)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}.png`)
  console.log(`✅ Generated icon-${size}.png`)
}

console.log("All icons generated!")

