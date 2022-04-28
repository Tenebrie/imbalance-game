import ServerCard from '../../ServerCard'
import { PlayTargetValidatorArguments } from '../../targetDefinitions/PlayTargetDefinition'
import { CardBotMetadata } from './CardBotMetadata'

export class CardBotMetadataBuilder {
	private readonly __card: ServerCard
	private readonly __scoreEvaluators: ((args: PlayTargetValidatorArguments) => number)[] = []

	private boonsPreference: 'prefer' | 'avoid' = 'prefer'
	private crowdsPreference: 'prefer' | 'avoid' = 'avoid'
	private hazardsPreference: 'prefer' | 'avoid' = 'avoid'
	private mulliganPreference: 'prefer' | 'avoid' | 'ignore' | 'singular' = 'ignore'

	public constructor(card: ServerCard) {
		this.__card = card
	}

	public evaluateScore(evaluator: (args: PlayTargetValidatorArguments) => number): CardBotMetadataBuilder {
		this.__scoreEvaluators.push(evaluator)
		return this
	}

	public setBoonsPreference(preference: 'prefer' | 'avoid'): CardBotMetadataBuilder {
		this.boonsPreference = preference
		return this
	}

	public setCrowdsPreference(preference: 'prefer' | 'avoid'): CardBotMetadataBuilder {
		this.crowdsPreference = preference
		return this
	}

	public setHazardsPreference(preference: 'prefer' | 'avoid'): CardBotMetadataBuilder {
		this.hazardsPreference = preference
		return this
	}

	public setMulliganPreference(preference: 'prefer' | 'avoid' | 'ignore' | 'singular'): CardBotMetadataBuilder {
		this.mulliganPreference = preference
		return this
	}

	public __build(): CardBotMetadata {
		return new CardBotMetadata(
			this.__card,
			this.__scoreEvaluators,
			this.boonsPreference,
			this.crowdsPreference,
			this.hazardsPreference,
			this.mulliganPreference
		)
	}
}
