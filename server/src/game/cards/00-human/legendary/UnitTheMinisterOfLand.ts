import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'
import BuffWeakness from '@src/game/buffs/BuffWeakness'

export default class UnitTheMinisterOfLand extends ServerCard {
	public static readonly WEAKNESS_POTENCY = 4
	public static readonly PEASANTS_REQUIRED = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_SUMMON],
			stats: {
				power: 30,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			weaknessPotency: UnitTheMinisterOfLand.WEAKNESS_POTENCY,
			peasantsRequired: UnitTheMinisterOfLand.PEASANTS_REQUIRED,
		}

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.DECK])
			.require(({ owner }) => owner === this.owner)
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.PEASANT))
			.require(() => game.board.getUnitsOfTribe(CardTribe.PEASANT, this.owner).length >= UnitTheMinisterOfLand.PEASANTS_REQUIRED)
			.perform(() => {
				const controlledRows = game.board.getControlledRows(this.owner).reverse()
				if (controlledRows[0].isFull()) {
					return
				}
				this.ownerInGame.cardDeck.removeCard(this)
				game.board.createUnit(this, controlledRows[0].index, controlledRows[0].cards.length)
			})

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.tribes.includes(CardTribe.PEASANT))
			.requireTarget(({ target }) => target.owner === this.owner)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.provide(BuffWeakness, UnitTheMinisterOfLand.WEAKNESS_POTENCY)
	}
}
