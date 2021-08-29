import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '../../../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'

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
				return !this.ownerPlayer.cardDeck.hasDuplicates || targetUnit.owner === this.ownerPlayer.opponent
			})
			.perform(({ targetUnit }) => {
				const copy = CardLibrary.instantiateFromInstance(this.game, targetUnit.card)
				this.ownerPlayer.cardDeck.addUnitToTop(copy)
			})
	}
}
