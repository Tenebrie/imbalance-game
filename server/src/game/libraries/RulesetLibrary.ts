import { colorize } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import { ServerRulesetTemplate } from '../models/rulesets/ServerRuleset'
import { loadModules } from './ModuleLoader'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'

export interface RulesetConstructor extends Function {
	new (): ServerRulesetBuilder<any>
}

class InternalRulesetLibrary {
	public rulesets: ServerRulesetTemplate[] = []

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

		console.info(`Loaded ${colorize(prototypes.length, AsciiColor.CYAN)} ruleset definitions`)
		if (prototypes.length === 0) {
			return
		}
	}

	public forceLoadRulesets(rulesets: RulesetConstructor[]): void {
		const newRulesets = rulesets.filter(
			(card) => !this.rulesets.some((existingRuleset) => existingRuleset.class === this.getClassFromConstructor(card))
		)
		this.rulesets = this.rulesets.concat(newRulesets.map((prototype) => new prototype().__build()))
	}

	public getClassFromConstructor(constructor: RulesetConstructor): string {
		return constructor.name.substr(0, 1).toLowerCase() + constructor.name.substr(1)
	}

	public findPrototypeByClass(rulesetClass: string): ServerRulesetTemplate {
		const card = this.rulesets.find((ruleset) => ruleset.class === rulesetClass)
		if (!card) {
			throw new Error(`Unable to find ruleset ${rulesetClass}`)
		}
		return card
	}

	public findTemplate(constructor: RulesetConstructor): ServerRulesetTemplate {
		return this.findPrototypeByClass(this.getClassFromConstructor(constructor))
	}
}

class RulesetLibrary {
	private library: InternalRulesetLibrary | null = null

	public ensureLibraryLoaded(): void {
		if (this.library === null) {
			this.library = new InternalRulesetLibrary()
			this.library.loadFromFilesystem()
		}
	}

	public get rulesets(): ServerRulesetTemplate[] {
		this.ensureLibraryLoaded()
		return this.library!.rulesets.slice()
	}

	public findTemplateByClass(rulesetClass: string): ServerRulesetTemplate {
		this.ensureLibraryLoaded()
		return this.library!.findPrototypeByClass(rulesetClass)
	}

	public findTemplate(constructor: RulesetConstructor): ServerRulesetTemplate {
		this.ensureLibraryLoaded()
		return this.library!.findTemplate(constructor)
	}
}

export default new RulesetLibrary()
