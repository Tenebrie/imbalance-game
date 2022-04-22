import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import BuffGwentSingleUsed from '@src/game/buffs/14-gwent/BuffGwentSingleUsed'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentYaevinn extends ServerCard {
	cardsToChoose: ServerCard[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ELF],
			features: [CardFeature.SPY],
			stats: {
				power: 13,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Yaevinn`,
				description: `*Single-Use*: Draw a special card and a unit. Keep one and return the other to your deck.`,
				flavor: `We are the drops of rain that together make a ferocious storm.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ owner }) => {
			const specialCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.SPELL)

			if (specialCards.length === 0) {
				return
			}

			this.cardsToChoose.push(getRandomArrayValue(specialCards))

			const unitCards = owner.cardDeck.allCards.filter((card) => card.type === CardType.UNIT)

			if (unitCards.length === 0) {
				return
			}

			this.cardsToChoose.push(getRandomArrayValue(unitCards))
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.require(() => !this.buffs.has(BuffGwentSingleUsed))
			.requireEnemy()
			.require(({ targetCard }) => this.cardsToChoose.includes(targetCard))
			.perform(({ targetCard, player }) => {
				Keywords.drawExactCard(player, targetCard)
			})
	}
}
