import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import PlayTargetDefinition, { PlayTargetValidatorArguments } from '@src/game/models/targetDefinitions/PlayTargetDefinition'
import { v4 as getRandomId } from 'uuid'

import ServerGame from '../ServerGame'

export default class PlayTargetDefinitionBuilder {
	private readonly id: string
	private readonly game: ServerGame
	private readonly __conditions: ((args: PlayTargetValidatorArguments) => boolean)[] = []
	private __evaluator: ((args: PlayTargetValidatorArguments) => number) | null = null

	private constructor(game: ServerGame) {
		this.id = `tdef:${getRandomId()}`
		this.game = game
	}

	public __build(): PlayTargetDefinition {
		return new PlayTargetDefinition(this.id, this.game, this.__conditions, this.__evaluator)
	}

	/* Require a condition to be true for the row to be a valid play target
	 * ------------------------------------------------------------------------
	 * Add a new condition to the require chain.
	 *
	 * The card can be played to the row if all conditions return `true` or other truthy value.
	 */
	public require(condition: (args: PlayTargetValidatorArguments) => boolean): PlayTargetDefinitionBuilder {
		this.__conditions.push(condition)
		return this
	}

	/* Evaluate the value an AI will get if it plays the card on a row
	 * ------------------------------------------------------------------------
	 * Set the AI evaluator function
	 */
	public evaluate(evaluator: (args: PlayTargetValidatorArguments) => number): PlayTargetDefinitionBuilder {
		this.__evaluator = evaluator
		return this
	}

	public static base(game: ServerGame): PlayTargetDefinitionBuilder {
		return new PlayTargetDefinitionBuilder(game)
			.require(({ card, targetRow }) => card.type === CardType.SPELL || !targetRow.isFull())
			.require(({ card, owner, targetRow }) => {
				return (
					card.type === CardType.SPELL ||
					(!card.features.includes(CardFeature.SPY) && targetRow.owner === owner.group) ||
					(card.features.includes(CardFeature.SPY) && targetRow.owner !== owner.group)
				)
			})
	}
}
