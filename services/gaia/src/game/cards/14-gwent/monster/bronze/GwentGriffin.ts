import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import GameEventCreators from '@src/game/models/events/GameEventCreators'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentGriffin extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Griffin',
				description: 'Trigger the *Deathwish* of a Bronze ally.',
				flavor: "Griffins like to toy with their prey. Eat 'em alive, piece by piece.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.HAS_DEATHWISH))
			.require(({ targetUnit }) => targetUnit.card.color === CardColor.BRONZE)
			.perform(({ targetUnit }) => {
				Keywords.triggerEvent(
					targetUnit.card,
					GameEventCreators.unitDestroyed({
						game,
						triggeringCard: targetUnit.card,
						triggeringUnit: targetUnit,
						reason: UnitDestructionReason.CARD_EFFECT,
						destroyer: this,
						owner: targetUnit.originalOwner,
						rowIndex: targetUnit.rowIndex,
						unitIndex: targetUnit.unitIndex,
					})
				)
			})
	}
}
