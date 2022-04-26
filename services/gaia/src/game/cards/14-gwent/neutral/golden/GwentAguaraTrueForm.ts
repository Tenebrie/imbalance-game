import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import CardLibrary from '@src/game/libraries/CardLibrary'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getStableRandomValues } from '@src/utils/Utils'

export default class GwentAguaraTrueForm extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.CURSED, CardTribe.RELICT],
			stats: {
				power: 2,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Aguara: True Form`,
				description: `*Create* any Bronze or Silver Spell.`,
				flavor: `Ever heard of an anterion? Think of it as the opposite of a lycanthrope: a beast which can take on human form.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require(({ targetCard }) =>
				getStableRandomValues(
					this,
					CardLibrary.cards
						.filter((card) => card.isCollectible)
						.filter((card) => card.isBronzeOrSilver)
						.filter((card) => card.tribes.includes(CardTribe.SPELL))
				).includes(targetCard)
			)
			.perform(({ targetCard }) => {
				Keywords.createCard.for(this.ownerPlayer).fromInstance(targetCard)
			})
	}
}
