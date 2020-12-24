import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
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
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
			sortPriority: 2,
		})

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.require(TargetType.UNIT, ({ targetUnit }) => {
				return !this.ownerInGame.cardDeck.hasDuplicates || targetUnit.owner === this.ownerInGame.opponent
			})

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => {
			const copy = CardLibrary.instantiateByInstance(targetUnit.card)
			this.ownerInGame.cardDeck.addUnitToTop(copy)
		})
	}
}
