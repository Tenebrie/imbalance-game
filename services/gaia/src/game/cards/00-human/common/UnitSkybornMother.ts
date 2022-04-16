import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffProtector from '@src/game/buffs/BuffProtector'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitSkybornMother extends ServerCard {
	powerGiven = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			features: [CardFeature.PROMINENT],
			stats: {
				power: 11,
				armor: 2,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerGiven: this.powerGiven,
		}
		this.buffs.add(BuffProtector, this)

		this.createSelector()
			.require(() => this.location === CardLocation.HAND)
			.requireTarget(({ target }) => target === getLastPlayedUnit())
			.requireTarget(({ target }) => target.ownerPlayer === this.ownerPlayer)
			.provide(BuffStrength, this.powerGiven)

		const getLastPlayedUnit = () =>
			game.cardPlay.playedCards
				.filter((playedCard) => playedCard.player === this.ownerPlayer)
				.filter((playedCard) => playedCard.card.location === CardLocation.BOARD)
				.reverse()[0]?.card
	}
}
