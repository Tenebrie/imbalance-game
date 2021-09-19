import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import CardLibrary from '../../../libraries/CardLibrary'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitMagiciansAssistant extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.NOBLE],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 14,
			},
			expansionSet: ExpansionSet.BASE,
			sortPriority: 2,
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => {
				return !this.ownerPlayer.cardDeck.hasDuplicates || targetUnit.owner === this.ownerPlayer.opponentNullable
			})
			.perform(({ targetUnit }) => {
				const copy = CardLibrary.instantiateFromInstance(this.game, targetUnit.card)
				this.ownerPlayer.cardDeck.addUnitToTop(copy)
			})
	}
}
