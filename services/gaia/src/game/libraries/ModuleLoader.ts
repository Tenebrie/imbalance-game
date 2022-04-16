import { colorize } from '@src/utils/Utils'
import * as fs from 'fs'
import glob from 'glob'
import path from 'path'

import AsciiColor from '../../enums/AsciiColor'

type Module<T> = {
	path: string
	filename: string
	timestamp: number
	defaultExport: T | null
	exports: T[]
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
	const normalizedPath = path.join(__dirname, props.path)
	const rulesetDefinitionFiles = glob.sync(`${normalizedPath}/**/*.js`)

	const cardModules: Module<T>[] = rulesetDefinitionFiles
		.map((path) => {
			try {
				return {
					path,
					importedModule: require(path),
				}
			} catch (err) {
				return {
					path,
					importedModule: null,
					error: err,
				}
			}
		})
		.filter((wrapper) => wrapper.importedModule !== null)
		.map((wrapper) => ({
			path: wrapper.path,
			filename: wrapper.path.substring(wrapper.path.lastIndexOf('/') + 1, wrapper.path.indexOf('.js')),
			timestamp: fs.statSync(wrapper.path).mtimeMs,
			defaultExport: wrapper.importedModule.default || null,
			exports: Object.values(wrapper.importedModule),
		}))
	console.info(`Found ${colorize(cardModules.length, AsciiColor.CYAN)} ${props.objectLogName} definition files`)

	const nameMismatchModules = cardModules.filter((module) => !!module.defaultExport && module.filename !== module.defaultExport.name)
	if (nameMismatchModules.length > 0) {
		const errorArray = nameMismatchModules.map((module) => ({
			file: module.filename,
			prototype: module.defaultExport!.name,
		}))
		console.warn(
			colorize(`Clearing ${nameMismatchModules.length} ${props.objectLogName} module(s) due to class name mismatch:`, AsciiColor.YELLOW),
			errorArray
		)
		nameMismatchModules.forEach((module) => fs.unlinkSync(module.path))
	}

	const upToDateModules = cardModules
		.filter((module) => (module.defaultExport && module.filename === module.defaultExport.name) || !module.defaultExport)
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
		.flatMap((module) => module.exports)
		.filter((prototype) => prototype.toString().startsWith('class'))

	return {
		prototypes,
		upToDateModules: cardModules,
		outdatedModules: [],
	}
}
