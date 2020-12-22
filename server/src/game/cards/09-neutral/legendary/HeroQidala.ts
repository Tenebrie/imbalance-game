import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import TargetType from '@shared/enums/TargetType'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import CardTribe from '@shared/enums/CardTribe'

export default class HeroQidala extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DISCARD],
			stats: {
				power: 6,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.addRelatedCards().requireTribe(CardTribe.LOOT)

		this.createDeployEffectTargets()
			.target(TargetType.CARD_IN_UNIT_DECK)
			.requireCardInPlayersDeck()
			.require(TargetType.CARD_IN_UNIT_DECK, (args) => args.targetCard.color === CardColor.SILVER)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		Keywords.summonCard(target)
	}
}
