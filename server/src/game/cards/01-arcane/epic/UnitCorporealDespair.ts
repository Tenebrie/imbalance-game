import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import UnitShadow from '@src/game/cards/01-arcane/tokens/UnitShadow'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitCorporealDespair extends ServerCard {
	fallbackTriggered = false

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			stats: {
				power: 19,
			},
			relatedCards: [UnitShadow],
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Corporeal Despair',
				description: '*Deploy:*<br>*Destroy* all Voidspawn on an allied row.<p>*Create* a Shadow with their Power combined.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(() => !this.fallbackTriggered)
			.requireAllied()
			.require(({ targetRow }) => targetRow.cards.some((unit) => unit.card.tribes.includes(CardTribe.VOIDSPAWN)))
			.perform(({ targetRow }) => {
				const units = targetRow.cards.filter((unit) => unit.card.tribes.includes(CardTribe.VOIDSPAWN))
				const totalPower = units.reduce((totalValue, unit) => totalValue + unit.card.stats.power, 0)

				units.forEach((unit) =>
					game.animation.thread(() => {
						Keywords.destroyUnit({
							unit,
							source: this,
						})
					})
				)
				game.animation.syncAnimationThreads()
				const card = Keywords.createCard.forOwnerOf(this).fromConstructor(UnitShadow)
				card.buffs.addMultiple(BuffStrength, totalPower - 1, this)
			})

		// No valid rows -> just create a shadow
		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => !game.board.getUnitsOwnedByGroup(this.ownerGroup).some((unit) => unit.card.tribes.includes(CardTribe.VOIDSPAWN)))
			.perform(() => Keywords.createCard.forOwnerOf(this).fromConstructor(UnitShadow))
			.perform(() => (this.fallbackTriggered = true))

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.fallbackTriggered = false))
	}
}
