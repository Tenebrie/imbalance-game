import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
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
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireSamePlayer()
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.BUILDING))
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
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
