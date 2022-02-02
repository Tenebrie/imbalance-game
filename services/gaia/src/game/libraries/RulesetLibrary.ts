import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import CardLibraryPlaceholderGame from '@src/game/utils/CardLibraryPlaceholderGame'
import { colorize, colorizeId, getClassFromConstructor } from '@src/utils/Utils'
import moment from 'moment'

import AsciiColor from '../../enums/AsciiColor'
import { loadModules } from './ModuleLoader'

export interface RulesetConstructor extends Function {
	new (game: ServerGame): ServerRuleset
}

class InternalRulesetLibrary {
	public rulesets: ServerRuleset[] = []

	public loadFromFilesystem() {
		// Do not load files if running tests
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}
		console.info(colorize('Loading ruleset definitions...', AsciiColor.YELLOW))

		const { prototypes, upToDateModules } = loadModules<RulesetConstructor>({
			path: '../rulesets',
			objectLogName: 'ruleset',
		})

		this.forceLoadRulesets(prototypes)

		console.info(`Loaded ${colorize(this.rulesets.length, AsciiColor.CYAN)} ruleset definitions`)
		if (prototypes.length === 0) {
			return
		}

		const oldestTimestamp = upToDateModules.sort((a, b) => a.timestamp - b.timestamp)[0].timestamp
		const newModules = upToDateModules.filter((module) => module.timestamp - oldestTimestamp > 1000)
		const sortedNewModules = newModules
			.filter((module) => !module.filename.toLowerCase().startsWith('testing'))
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, 5)
		console.info(
			'Latest updated ruleset definitions: [',
			sortedNewModules
				.map(
					(module) =>
						`\n  [${colorize(moment(new Date(module.timestamp)).format('yyyy.MM.DD | HH:mm:ss'), AsciiColor.BLUE)}]: ${colorizeId(
							module.filename
						)}`
				)
				.join('') + '\n]'
		)
		console.info(colorize('Ruleset library loaded successfully', AsciiColor.GREEN) + '\n')
	}

	public forceLoadRulesets(rulesets: RulesetConstructor[]): void {
		const newRulesets = rulesets
			.filter((ruleset) => !this.rulesets.some((existingRuleset) => existingRuleset.class === getClassFromConstructor(ruleset)))
			.filter((ruleset) => !getClassFromConstructor(ruleset).startsWith('base') && !getClassFromConstructor(ruleset).startsWith('testing'))
		this.rulesets = this.rulesets.concat(newRulesets.map((prototype) => new prototype(CardLibraryPlaceholderGame.get())))
	}

	public findPrototypeByClass(rulesetClass: string): ServerRuleset {
		const ruleset = this.rulesets.find((ruleset) => ruleset.class === rulesetClass)
		if (!ruleset) {
			throw new Error(`Unable to find ruleset ${rulesetClass}`)
		}
		return ruleset
	}

	public findRedirectablePrototypeByClass(rulesetClass: string): ServerRuleset {
		const ruleset = this.rulesets.find((ruleset) => ruleset.class === rulesetClass)
		if (!ruleset) {
			throw new Error(`Unable to find ruleset ${rulesetClass}`)
		}
		if (ruleset.redirectTo) {
			return this.findRedirectablePrototypeByClass(getClassFromConstructor(ruleset.redirectTo))
		}
		return ruleset
	}

	public findTemplate(constructor: RulesetConstructor): ServerRuleset {
		return this.findPrototypeByClass(getClassFromConstructor(constructor))
	}

	public instantiate(game: ServerGame, constructor: RulesetConstructor): ServerRuleset {
		const rulesetClass = getClassFromConstructor(constructor)
		if (!this.rulesets.find((ruleset) => ruleset.class === rulesetClass)) {
			this.forceLoadRulesets([constructor])
		}
		return this.instantiateFromClass(game, rulesetClass)
	}

	public instantiateFromInstance(game: ServerGame, ruleset: ServerRuleset): ServerRuleset {
		const rulesetClass = getClassFromConstructor(ruleset.constructor as RulesetConstructor)
		return this.instantiateFromClass(game, rulesetClass)
	}

	public instantiateFromClass(game: ServerGame, rulesetClass: string): ServerRuleset {
		const reference = this.rulesets.find((ruleset) => {
			return ruleset.class === rulesetClass
		})
		if (!reference) {
			console.error(`No registered ruleset with class '${rulesetClass}'!`)
			throw new Error(`No registered ruleset with class '${rulesetClass}'!`)
		}

		const referenceConstructor = reference.constructor as RulesetConstructor
		return new referenceConstructor(game)
	}
}

class RulesetLibrary {
	private library: InternalRulesetLibrary = new InternalRulesetLibrary()
	private libraryLoaded = false

	public ensureLibraryLoaded(): void {
		if (!this.libraryLoaded) {
			this.libraryLoaded = true
			this.library.loadFromFilesystem()
		}
	}

	public get rulesets(): ServerRuleset[] {
		this.ensureLibraryLoaded()
		return this.library.rulesets.slice()
	}

	public findTemplateByClass(rulesetClass: string): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.findPrototypeByClass(rulesetClass)
	}

	public findRedirectableTemplateByClass(rulesetClass: string): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.findRedirectablePrototypeByClass(rulesetClass)
	}

	public findTemplate(constructor: RulesetConstructor): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.findTemplate(constructor)
	}

	public instantiate(game: ServerGame, constructor: RulesetConstructor): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.instantiate(game, constructor)
	}

	public instantiateFromInstance(game: ServerGame, ruleset: ServerRuleset): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.instantiateFromInstance(game, ruleset)
	}

	public instantiateFromClass(game: ServerGame, rulesetClass: string): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library.instantiateFromClass(game, rulesetClass)
	}
}

export default new RulesetLibrary()
