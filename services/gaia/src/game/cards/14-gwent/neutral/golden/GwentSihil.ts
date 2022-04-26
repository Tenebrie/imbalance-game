import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentSihilEven from './GwentSihilEven'
import GwentSihilFallback from './GwentSihilFallback'
import GwentSihilOdd from './GwentSihilOdd'

export default class GwentSihil extends ServerCard {
	public static readonly VAR_0 = 3
	public static readonly VAR_1 = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Sihil`,
				description: `Choose One: Deal *${GwentSihilOdd.DAMAGE}* damage to all enemies with odd power; or Deal *${GwentSihilEven.DAMAGE}* damage to all enemies with even power; or Play a random Bronze or Silver unit from your deck.`,
				flavor: `What's written on this blade? That a curse? No. An insult.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(
				({ targetCard }) =>
					targetCard instanceof GwentSihilOdd || targetCard instanceof GwentSihilEven || targetCard instanceof GwentSihilFallback
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.forOwnerOf(this).fromInstance(targetCard)
			})
	}
}
