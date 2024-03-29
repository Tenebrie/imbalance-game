#!/usr/bin/env node

const fs = require('fs')
const { exec } = require('child_process')

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

const printInfo = (value, data) => {
	if (data) {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.GREEN)}`, data)
	} else {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.GREEN)}`)
	}
}

const printWarn = (value, data) => {
	if (data) {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.YELLOW)}`, data)
	} else {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.YELLOW)}`)
	}
}

const printError = (value, data) => {
	if (data) {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.RED)}`, data)
	} else {
		console.info(`${colorize('[Build]', AsciiColor.MAGENTA)} ${colorize(value, AsciiColor.RED)}`)
	}
}

const hashCode = (targetString) => {
	let i
	let chr
	let hash = 0
	if (targetString.length === 0) {
		return hash
	}
	for (i = 0; i < targetString.length; i++) {
		chr = targetString.charCodeAt(i)
		hash = (hash << 5) - hash + chr
		hash |= 0 // Convert to 32bit integer
	}
	return hash
}

const getClientHash = () => {
	const packageJson = fs.readFileSync('client/package.json').toString()
	return hashCode(packageJson)
}

const getGaiaHash = () => {
	const packageJson = fs.readFileSync('services/gaia/package.json').toString()
	const tsconfig = fs.readFileSync('services/gaia/tsconfig.json').toString()
	const migrationCount = fs.readdirSync('services/gaia/migrations').length
	const secretsFile = fs.existsSync('secrets/gaia.json') ? fs.readFileSync('secrets/gaia.json').toString() : ''
	return hashCode(packageJson + tsconfig + migrationCount + secretsFile)
}

const getOvermindHash = () => {
	const packageJson = fs.readFileSync('services/overmind/package.json').toString()
	return hashCode(packageJson)
}

const saveDockerVersion = () => {
	const object = {
		hashes: {
			client: getClientHash(),
			gaia: getGaiaHash(),
			overmind: getOvermindHash(),
		},
	}
	fs.writeFileSync('.docker-version', JSON.stringify(object))
}

let containersBeingBuilt = 0
const postBuild = () => {
	if (containersBeingBuilt > 0) {
		return
	}

	saveDockerVersion()
}

const buildClient = () => {
	containersBeingBuilt += 1
	printWarn('Building Client...')
	exec('docker-compose rm -f client && docker-compose build client', (error) => {
		if (error) {
			printError('Unable to build Client', error)
			return
		}
		containersBeingBuilt -= 1
		printInfo('Client build successful!')
		postBuild()
	})
}
const buildGaia = () => {
	containersBeingBuilt += 1
	printWarn('Building Gaia...')
	exec('docker-compose rm -f gaia && docker-compose build gaia', (error) => {
		if (error) {
			printError('Unable to build Gaia', error)
			return
		}
		containersBeingBuilt -= 1
		printInfo('Gaia build successful!')
		postBuild()
	})
}
const buildOvermind = () => {
	containersBeingBuilt += 1
	printWarn('Building Overmind...')
	exec('docker-compose rm -f overmind && docker-compose build overmind', (error) => {
		if (error) {
			printError('Unable to build Overmind', error)
			return
		}
		containersBeingBuilt -= 1
		printInfo('Overmind build successful!')
		postBuild()
	})
}

const buildAll = () => {
	buildClient()
	buildGaia()
	buildOvermind()
}

printInfo('Checking secrets files...')
if (!fs.existsSync('secrets/gaia.json')) {
	printWarn('Gaia secrets file not found. Writing a placeholder.')
	fs.writeFileSync('secrets/gaia.json', JSON.stringify({}), 'utf8')
	printInfo('Gaia secrets file placeholder written.')
} else {
	printInfo('Gaia secrets file exists')
}

printInfo('Checking container hashes...')
if (!fs.existsSync('.docker-version')) {
	printWarn('No .docker-version file found. Rebuilding all containers.')
	buildAll()
	return
}

const file = fs.readFileSync('.docker-version', 'utf8')
try {
	JSON.parse(file)
} catch (err) {
	printError('Malformed .docker-version file. Rebuilding all containers.', err)
	buildAll()
	return
}

const object = JSON.parse(file)

const savedClientHash = object.hashes.client
if (getClientHash() !== savedClientHash) {
	printWarn('Client container hash mismatch.')
	buildClient()
}

const savedGaiaHash = object.hashes.gaia
if (getGaiaHash() !== savedGaiaHash) {
	printWarn('Gaia service container hash mismatch.')
	buildGaia()
}

const savedOvermindHash = object.hashes.overmind
if (getOvermindHash() !== savedOvermindHash) {
	printWarn('Overmind service container hash mismatch.')
	buildOvermind()
}

if (getClientHash() === savedClientHash && getGaiaHash() === savedGaiaHash && getOvermindHash() === savedOvermindHash) {
	printInfo('All container hashes match.')
}
