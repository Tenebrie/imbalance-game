import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentSheTrollOfVergen extends ServerCard {
	private cardToConsume: ServerCard | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'She-Troll of Vergen',
				description: 'Play a Bronze *Deathwish* unit from your deck.\n*Consume* it and boost self by its base power.',
				flavor: 'Lover of elf and onion soup.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_DECK)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => targetCard.features.includes(CardFeature.HAS_DEATHWISH))
			.perform(({ targetCard }) => {
				Keywords.playCardFromDeck(targetCard)
				this.cardToConsume = targetCard
			})

		this.createCallback(GameEventType.CARD_RESOLVED, [CardLocation.BOARD])
			.require(({ triggeringCard }) => triggeringCard === this.cardToConsume)
			.perform(({ triggeringCard }) => {
				Keywords.consume.units({
					targets: [triggeringCard.unit!],
					consumer: this,
				})
				this.cardToConsume = null
			})
	}
}
