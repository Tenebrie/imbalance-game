import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '../../../buffs/BuffStrength'

export default class UnitSkybornMother extends ServerCard {
	powerGiven = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 13,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerGiven: this.powerGiven,
		}

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
