const fs = require('fs')
const glob = require('glob')
const sharp = require('sharp')

const AsciiColor = {
    BLACK: '\u001b[30;1m',
    RED: '\u001b[31;1m',
    GREEN: '\u001b[32;1m',
    YELLOW: '\u001b[33;1m',
    BLUE: '\u001b[34;1m',
    MAGENTA: '\u001b[35;1m',
    CYAN: '\u001b[36;1m',
    WHITE: '\u001b[37;1m',
}

const colorize = (text, color) => {
    return `${color}${text}\u001b[0m`
}

glob("**/*.@(webp)", async (er, files) => {
    const promises = files.map(file => {
        const newFileName = file.substr(0, file.lastIndexOf('.')) + '.png'
        console.info(`Converting ${colorize(file, AsciiColor.MAGENTA)} -> ${colorize(newFileName, AsciiColor.CYAN)}`)
        return sharp(file)
            .png({
                quality: 80
            })
			.resize(4096)
            .toFile(newFileName)
    })
    console.info(`Waiting for ${promises.length} files to convert...`)
    await Promise.all(promises)
    console.info('Conversion done!')
})
