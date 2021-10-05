const fs = require('fs')
const glob = require('glob')
const uglify = require('uglify-js')

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

glob('dist/**/*.@(js)', async (er, files) => {
	const fileCode = await Promise.all(
		files.map(
			(file) =>
				new Promise((resolve) => {
					const options = fs.existsSync(`${file}.map`)
						? {
								sourceMap: {
									content: fs.readFileSync(`${file}.map`, 'utf8'),
									url: 'inline',
								},
						  }
						: {}

					resolve({
						file,
						...uglify.minify(fs.readFileSync(file, 'utf8'), options),
					})
				})
		)
	)

	await Promise.all(
		fileCode.map((file) => {
			if (!file.code) {
				console.log(file)
			}
			fs.writeFileSync(file.file, file.code)
		})
	)

	console.info(`Successfully minified ${colorize(fileCode.length, AsciiColor.CYAN)} .js files.`)
})
