import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffWeakness from '@src/game/buffs/BuffWeakness'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class UnitTheMinisterOfLand extends ServerCard {
	public static readonly WEAKNESS_POTENCY = 4
	public static readonly PEASANTS_REQUIRED = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.NOBLE],
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
			.require(({ owner }) => owner === this.ownerGroup)
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.COMMONER))
			.require(
				() => game.board.getSplashableUnitsOfTribe(CardTribe.COMMONER, this.ownerGroup).length >= UnitTheMinisterOfLand.PEASANTS_REQUIRED
			)
			.perform(() => {
				const controlledRows = game.board.getControlledRows(this.ownerPlayerNullable).reverse()
				if (controlledRows[0].isFull()) {
					return
				}
				const owner = this.ownerPlayer
				owner.cardDeck.removeCard(this)
				game.board.createUnit(this, owner, controlledRows[0].index, controlledRows[0].cards.length)
			})

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.tribes.includes(CardTribe.COMMONER))
			.requireTarget(({ target }) => target.ownerPlayerNullable === this.ownerPlayerNullable)
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.provide(BuffWeakness, UnitTheMinisterOfLand.WEAKNESS_POTENCY)
	}
}
