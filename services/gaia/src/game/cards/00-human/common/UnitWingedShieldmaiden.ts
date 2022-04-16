import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import DamageSource from '@shared/enums/DamageSource'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import MoveDirection from '@shared/enums/MoveDirection'
import BuffProtector from '@src/game/buffs/BuffProtector'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class UnitWingedShieldmaiden extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			features: [CardFeature.PROMINENT],
			stats: {
				power: 2,
				armor: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.buffs.add(BuffProtector, this)

		this.createLocalization({
			en: {
				name: 'Winged Shieldmaiden',
				description:
					'Before an ally takes damage from an enemy card, *Summon* this from your hand in front of the target and *Draw* a card.' +
					'<p>' +
					'<i>Does not trigger for cards on the front row.</i>',
				flavor: `- "That girl? Not again. She's so much more trouble than she could ever be worth..."`,
			},
		})

		this.createCallback(GameEventType.BEFORE_CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(({ triggeringCard }) => triggeringCard.ownerGroup === this.ownerGroup)
			.require(({ triggeringCard }) => triggeringCard.location === CardLocation.BOARD)
			.require(({ triggeringCard }) => game.board.getDistanceToStaticFront(triggeringCard.unit!.rowIndex) > 0)
			.require(({ damageInstance }) => damageInstance.source === DamageSource.CARD && !damageInstance.sourceCard.ownerGroup.owns(this))
			.perform(({ triggeringCard }) => {
				const triggeringUnit = triggeringCard.unit!
				const targetRowIndex = game.board.rowMove(this.ownerGroup, triggeringUnit.rowIndex, MoveDirection.FORWARD, 1)
				if (game.board.rows[targetRowIndex].isFull()) {
					return
				}

				const possiblePositions = Array(game.board.rows[targetRowIndex].cards.length + 1)
					.fill(0)
					.map((_, index) => index)
				const closestDistance = possiblePositions
					.map((unitIndex) => ({
						unitIndex,
						distance: game.board.getHorizontalUnitDistance(triggeringUnit, {
							rowIndex: targetRowIndex,
							unitIndex,
							extraUnits: 1,
						}),
					}))
					.sort((a, b) => a.distance - b.distance)[0]

				if (closestDistance === undefined) {
					return
				}

				const ownerPlayer = this.ownerPlayer
				const summonedUnit = Keywords.summonUnitFromHand({
					card: this,
					owner: this.ownerPlayer,
					rowIndex: targetRowIndex,
					unitIndex: closestDistance.unitIndex,
				})
				if (summonedUnit) {
					ownerPlayer.drawUnitCards(1)
				}
			})
	}
}
