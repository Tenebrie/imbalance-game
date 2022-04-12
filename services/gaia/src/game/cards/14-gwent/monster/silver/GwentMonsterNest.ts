import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMonsterNest extends ServerCard {
	public static readonly BOOST = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			boost: GwentMonsterNest.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Monster Nest',
				description: '*Spawn* a Bronze Necrophage or Insectoid and boost it by {boost}.',
				flavor: "Damn, the filth's o'errun us… We need a witcher or there's no livin' 'ere!",
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) => targetCard.isCollectible)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.NECROPHAGE) || targetCard.tribes.includes(CardTribe.INSECTOID))
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
