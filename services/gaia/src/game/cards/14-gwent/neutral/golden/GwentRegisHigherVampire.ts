import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getStableRandomValues } from '@src/utils/Utils'

export default class GwentRegisHigherVampire extends ServerCard {
	public static readonly CARDS_TO_LOOK = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 6,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Regis: Higher Vampire`,
				description: `Look at *${GwentRegisHigherVampire.CARDS_TO_LOOK}* Bronze units from your opponent's deck. *Consume* one, then boost self by its power.`,
				flavor: `He becomes invisible at will. His glance hypnotizes into a deep sleep. He then drinks his fill, turns into a bat and flies off. Altogether uncouth.`,
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireEnemy()
			.require(({ targetCard, player }) =>
				getStableRandomValues(
					this,
					player.opponent.players[0].cardDeck.allCards
						.filter((card) => card.type === CardType.UNIT)
						.filter((card) => card.color === CardColor.BRONZE)
				).includes(targetCard)
			)
			.perform(({ targetCard }) => {
				Keywords.consume.cards({
					targets: [targetCard],
					consumer: this,
				})
			})
	}
}
