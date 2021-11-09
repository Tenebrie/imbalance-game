import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class SpellBloodPlague extends ServerCard {
	public static readonly TARGET_DAMAGE = 1
	public static readonly ADJACENT_DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.PASSIVE],
			stats: {
				cost: 0,
			},
			relatedCards: [SpellBloodPlague],
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			targetDamage: SpellBloodPlague.TARGET_DAMAGE,
			adjacentDamage: SpellBloodPlague.ADJACENT_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Blood Plague',
				description:
					'Whenever you play a unit, deal {targetDamage} Damage to it and {adjacentDamage} Damage to adjacent units.<br>Then, *Discard* this card.' +
					'<p>' +
					'If any of the adjacent units takes Power damage, add another copy of *Blood Plague* to your hand.',
			},
		})

		let targetedCards: ServerCard[] = []
		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.HAND])
			.require(({ owner }) => owner === this.ownerPlayer)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.UNIT)
			.perform(({ triggeringCard }) => {
				const unit = triggeringCard.unit
				if (!unit) {
					return
				}

				const adjacentUnits = game.board.getAdjacentUnits(unit)

				unit.dealDamage(DamageInstance.fromCard(SpellBloodPlague.TARGET_DAMAGE, this))
				targetedCards = adjacentUnits.map((unit) => unit.card)
				adjacentUnits.forEach((adjacentUnit) => {
					game.animation.thread(() => {
						adjacentUnit.dealDamage(DamageInstance.fromCard(SpellBloodPlague.ADJACENT_DAMAGE, this))
					})
				})
				game.animation.syncAnimationThreads()
				Keywords.discardCard(this)
			})

		this.createCallback(GameEventType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ triggeringCard }) => targetedCards.includes(triggeringCard))
			.require(({ powerDamageInstance }) => !!powerDamageInstance && powerDamageInstance.value > 0)
			.perform(() => {
				Keywords.addCardToHand.forOwnerOf(this).fromConstructor(SpellBloodPlague, {
					reveal: true,
				})
			})
	}
}
