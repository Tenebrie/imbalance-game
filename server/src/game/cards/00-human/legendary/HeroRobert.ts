import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '../../../../utils/Keywords'
import CardFeature from '@shared/enums/CardFeature'
import BuffNoArmor from '../../../buffs/BuffNoArmor'

export default class HeroRobert extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE, CardFeature.KEYWORD_SUMMON],
			stats: {
				power: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.BUILDING))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onTargetSelected(target: ServerCard): void {
		target.buffs.add(BuffNoArmor, this)
		Keywords.summonCard(target)
		Keywords.createCard
			.forOwnerOf(this)
			.with((card) => card.buffs.add(BuffNoArmor, this))
			.fromInstance(target)
	}
}
