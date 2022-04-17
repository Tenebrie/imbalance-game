import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentDoppler extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Doppler',
				description: '*Spawn* a random Bronze unit from your faction.',
				flavor:
					'Humans despise dopplers so much, they feel mere execution does not suffice - so they tie any they catch to a stake, cover them in thick clay and bake them in a fire.',
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const faction = owner.leader.faction
			const validCards = CardLibrary.cards.filter(
				(card) => card.isCollectible && card.faction === faction && card.color === CardColor.BRONZE && card.type === CardType.UNIT
			)
			Keywords.createCard.forOwnerOf(this).fromInstance(getRandomArrayValue(validCards))
		})
	}
}
