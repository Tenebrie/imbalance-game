import { colorize, getClassFromConstructor } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import { loadModules } from './ModuleLoader'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import CardLibraryPlaceholderGame from '@src/game/utils/CardLibraryPlaceholderGame'

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

		const { prototypes } = loadModules<RulesetConstructor>({
			path: '../rulesets',
			objectLogName: 'ruleset',
		})

		this.forceLoadRulesets(prototypes)

		console.info(`Loaded ${colorize(this.rulesets.length, AsciiColor.CYAN)} ruleset definitions`)
		if (prototypes.length === 0) {
			return
		}
	}

	public forceLoadRulesets(rulesets: RulesetConstructor[]): void {
		const newRulesets = rulesets
			.filter((ruleset) => !this.rulesets.some((existingRuleset) => existingRuleset.class === this.getClassFromConstructor(ruleset)))
			.filter((ruleset) => !getClassFromConstructor(ruleset).startsWith('base') && !getClassFromConstructor(ruleset).startsWith('testing'))
		this.rulesets = this.rulesets.concat(newRulesets.map((prototype) => new prototype(CardLibraryPlaceholderGame.get())))
	}

	public getClassFromConstructor(constructor: RulesetConstructor): string {
		return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
	}

	public findPrototypeByClass(rulesetClass: string): ServerRuleset {
		const card = this.rulesets.find((ruleset) => ruleset.class === rulesetClass)
		if (!card) {
			throw new Error(`Unable to find ruleset ${rulesetClass}`)
		}
		return card
	}

	public findTemplate(constructor: RulesetConstructor): ServerRuleset {
		return this.findPrototypeByClass(this.getClassFromConstructor(constructor))
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
		return this.library!.rulesets.slice()
	}

	public findTemplateByClass(rulesetClass: string): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library!.findPrototypeByClass(rulesetClass)
	}

	public findTemplate(constructor: RulesetConstructor): ServerRuleset {
		this.ensureLibraryLoaded()
		return this.library!.findTemplate(constructor)
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
