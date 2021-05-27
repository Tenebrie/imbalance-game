import path from 'path'
import glob from 'glob'
import * as fs from 'fs'
import { colorize } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'

type Module<T> = {
	path: string
	filename: string
	timestamp: number
	prototypeFunction: T
}

type Props = {
	path: string
	objectLogName: string
}

type ReturnValue<T> = {
	prototypes: T[]
	upToDateModules: Module<T>[]
	outdatedModules: Module<T>[]
}

export function loadModules<T extends { name: string }>(props: Props): ReturnValue<T> {
	// Do not load files if running tests
	if (process.env.JEST_WORKER_ID !== undefined) {
		return {
			prototypes: [],
			upToDateModules: [],
			outdatedModules: [],
		}
	}

	const normalizedPath = path.join(__dirname, props.path)
	const rulesetDefinitionFiles = glob.sync(`${normalizedPath}/**/*.js`)

	const cardModules: Module<T>[] = rulesetDefinitionFiles.map((path) => ({
		path: path,
		filename: path.substring(path.lastIndexOf('/') + 1, path.indexOf('.js')),
		timestamp: fs.statSync(path).mtimeMs,
		prototypeFunction: require(path).default,
	}))
	console.info(`Found ${colorize(cardModules.length, AsciiColor.CYAN)} ${props.objectLogName} definition files`)

	const nameMismatchModules = cardModules.filter((module) => module.filename !== module.prototypeFunction.name)
	if (nameMismatchModules.length > 0) {
		const errorArray = nameMismatchModules.map((module) => ({
			file: module.filename,
			prototype: module.prototypeFunction.name,
		}))
		console.warn(
			colorize(`Clearing ${nameMismatchModules.length} ${props.objectLogName} module(s) due to class name mismatch:`, AsciiColor.YELLOW),
			errorArray
		)
		nameMismatchModules.forEach((module) => fs.unlinkSync(module.path))
	}

	const upToDateModules = cardModules
		.filter((module) => module.filename === module.prototypeFunction.name)
		.reduce((acc: Module<T>[], obj) => {
			const updatedArray = acc.slice()
			const savedObject = updatedArray.find((savedObject) => savedObject.filename === obj.filename)
			if (!savedObject) {
				updatedArray.push(obj)
			} else if (obj.timestamp > savedObject.timestamp) {
				updatedArray.splice(updatedArray.indexOf(savedObject), 1, obj)
			}
			return updatedArray
		}, [])

	const outdatedModules = cardModules.filter((module) => !upToDateModules.includes(module) && !nameMismatchModules.includes(module))
	if (outdatedModules.length > 0) {
		console.info(colorize(`Clearing ${outdatedModules.length} outdated ${props.objectLogName} module(s)`, AsciiColor.YELLOW))
		outdatedModules.forEach((module) => fs.unlinkSync(module.path))
	}

	const prototypes = upToDateModules
		.filter((module) => !module.filename.toLowerCase().startsWith('testing'))
		.map((module) => module.prototypeFunction)

	return {
		prototypes,
		upToDateModules,
		outdatedModules,
	}
}
