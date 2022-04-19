import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentRotfiend extends ServerCard {
	public static readonly DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			tribes: [CardTribe.NECROPHAGE],
			faction: CardFaction.MONSTER,
			features: [CardFeature.HAS_DEATHWISH],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentRotfiend.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Rotfiend',
				description: '*Deathwish:* Deal {damage} damage to units on the opposite row.',
				flavor: "You'll smell them long before you see them.",
			},
		})

		this.createEffect(GameEventType.UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(({ triggeringUnit }) => {
				const owner = triggeringUnit.owner
				const oppositeRow = game.board.getRowWithDistanceToFront(owner.opponent, game.board.getDistanceToFront(triggeringUnit.rowIndex))
				const targets = oppositeRow.cards
				targets.forEach((target) => {
					game.animation.thread(() => {
						target.dealDamage(DamageInstance.fromCard(GwentRotfiend.DAMAGE, this))
					})
				})
				game.animation.syncAnimationThreads()
			})
	}
}
