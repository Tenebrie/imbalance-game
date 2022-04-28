import ServerCard from '../../ServerCard'
import ServerGame from '../../ServerGame'
import { PlayTargetValidatorArguments } from '../../targetDefinitions/PlayTargetDefinition'
import { CardBotMetadataBuilder } from './CardBotMetadataBuilder'

export class CardBotMetadata {
	private readonly game: ServerGame
	private readonly card: ServerCard
	private readonly playRowScoreEvaluators: ((args: PlayTargetValidatorArguments) => number)[]

	public readonly boonsPreference: 'prefer' | 'avoid'
	public readonly crowdsPreference: 'prefer' | 'avoid'
	public readonly hazardsPreference: 'prefer' | 'avoid'
	public readonly mulliganPreference: 'prefer' | 'avoid' | 'ignore' | 'singular'

	public constructor(
		card: ServerCard,
		scoreEvaluators: ((args: PlayTargetValidatorArguments) => number)[],
		boonsPreference: 'prefer' | 'avoid',
		crowdsPreference: 'prefer' | 'avoid',
		hazardsPreference: 'prefer' | 'avoid',
		mulliganPreference: 'prefer' | 'avoid' | 'ignore' | 'singular'
	) {
		this.game = card.game
		this.card = card
		this.playRowScoreEvaluators = scoreEvaluators.slice()
		this.boonsPreference = boonsPreference
		this.crowdsPreference = crowdsPreference
		this.hazardsPreference = hazardsPreference
		this.mulliganPreference = mulliganPreference
	}

	public evaluateExpectedScore(): number {
		const owner = this.card.ownerPlayer
		return (
			this.card.targeting
				.getPlayTargets(owner, {
					checkMana: false,
				})
				.map(
					(targetWrapper) =>
						targetWrapper.definition.evaluate({
							card: this.card,
							owner: owner,
							targetRow: targetWrapper.target.targetRow,
							targetPosition: targetWrapper.target.targetPosition,
						}) +
						this.evaluatePlayRowScore({
							card: this.card,
							owner: owner,
							targetRow: targetWrapper.target.targetRow,
							targetPosition: targetWrapper.target.targetPosition,
						})
				)
				.sort((a, b) => b - a)[0] || 0
		)
	}

	public evaluatePlayRowScore(args: PlayTargetValidatorArguments): number {
		const powerScore = this.card.stats.power
		const evaluatorScore = this.playRowScoreEvaluators.reduce((currentScore, evaluator) => currentScore + evaluator(args), 0)
		return powerScore + evaluatorScore
	}

	public evaluateBotScore(): number {
		const owner = this.card.ownerPlayer
		return (
			this.card.targeting
				.getPlayTargets(owner, {
					checkMana: false,
				})
				.map(
					(targetWrapper) =>
						targetWrapper.definition.evaluate({
							card: this.card,
							owner: owner,
							targetRow: targetWrapper.target.targetRow,
							targetPosition: targetWrapper.target.targetPosition,
						}) +
						this.evaluateBotPlayRowScore({
							card: this.card,
							owner: owner,
							targetRow: targetWrapper.target.targetRow,
							targetPosition: targetWrapper.target.targetPosition,
						})
				)
				.sort((a, b) => b - a)[0] || 0
		)
	}

	public evaluateBotPlayRowScore(args: PlayTargetValidatorArguments): number {
		const allRowsHaveHazards = this.game.board.getControlledRows(args.owner).every((row) => row.hasHazard)
		const allOtherRowsHaveHazards = this.game.board
			.getControlledRows(args.owner)
			.filter((row) => row !== args.targetRow)
			.every((row) => row.hasHazard)

		const powerScore = this.card.stats.power
		const evaluatorScore = this.playRowScoreEvaluators.reduce((currentScore, evaluator) => currentScore + evaluator(args), 0)
		const boonsPreferenceScore = Number(args.targetRow.hasBoon) * (this.boonsPreference === 'prefer' ? 15 : -15)
		const hazardsPreferenceScore = Number(args.targetRow.hasHazard) * (this.hazardsPreference === 'prefer' ? 50 : -50)
		const crowdsPreferenceScore = (() => {
			if (!allRowsHaveHazards && allOtherRowsHaveHazards && this.crowdsPreference === 'avoid') {
				return 0
			}
			return this.game.board.getTotalRowPower(args.targetRow) * (this.crowdsPreference === 'prefer' ? 1 : -1)
		})()
		return powerScore + evaluatorScore + crowdsPreferenceScore + boonsPreferenceScore + hazardsPreferenceScore
	}
}

export const getDefaultCardBotMetadata = (card: ServerCard): CardBotMetadata => {
	return new CardBotMetadataBuilder(card).__build()
}
