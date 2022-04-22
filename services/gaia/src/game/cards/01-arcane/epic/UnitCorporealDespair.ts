import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import BuffWeaknessHidden from '@src/game/buffs/BuffWeaknessHidden'
import UnitShadow from '@src/game/cards/01-arcane/tokens/UnitShadow'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

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

				const card = Keywords.createCard.forOwnerOf(this).fromConstructor(UnitShadow)
				card.buffs.add(BuffWeaknessHidden, null, 'default')
				units.forEach((unit) => {
					game.animation.thread(() => {
						const power = unit.card.stats.power
						Keywords.destroyUnit({
							unit,
							source: this,
							affectedCards: [card],
						})
						card.buffs.addMultiple(BuffStrength, power, null, 'default', true)
					})
				})

				game.animation.syncAnimationThreads()
			})

		// No valid rows -> just create a shadow
		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.require(() => !game.board.getSplashableUnitsFor(this.ownerGroup).some((unit) => unit.card.tribes.includes(CardTribe.VOIDSPAWN)))
			.perform(() => Keywords.createCard.forOwnerOf(this).fromConstructor(UnitShadow))
			.perform(() => (this.fallbackTriggered = true))

		this.createEffect(GameEventType.CARD_RESOLVED).perform(() => (this.fallbackTriggered = false))
	}
}
