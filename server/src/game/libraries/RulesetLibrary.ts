import { colorize } from '@src/utils/Utils'
import AsciiColor from '../../enums/AsciiColor'
import { ServerRulesetBuilder, ServerRulesetTemplate } from '../models/rulesets/ServerRuleset'
import { loadModules } from './ModuleLoader'

export interface RulesetConstructor extends ObjectConstructor {
	new (): ServerRulesetBuilder
}

class RulesetLibrary {
	public rulesets: ServerRulesetTemplate[] = []

	constructor() {
		// Do not load files if running tests
		if (process.env.JEST_WORKER_ID !== undefined) {
			return
		}

		const { prototypes } = loadModules<RulesetConstructor>({
			path: '../rulesets',
			objectLogName: 'ruleset',
		})

		this.forceLoadCards(prototypes)

		console.info(`Loaded ${colorize(prototypes.length, AsciiColor.CYAN)} ruleset definitions`)
		if (prototypes.length === 0) {
			return
		}
	}

	public forceLoadCards(cards: RulesetConstructor[]): void {
		const newCards = cards.filter(
			(card) => !this.rulesets.some((existingCard) => existingCard.class === this.getClassFromConstructor(card))
		)
		this.rulesets = this.rulesets.concat(newCards.map((prototype) => new prototype().__build()))
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

	public findPrototypeByConstructor(constructor: RulesetConstructor): ServerRulesetTemplate {
		return this.findPrototypeByClass(this.getClassFromConstructor(constructor))
	}
}

export default new RulesetLibrary()
