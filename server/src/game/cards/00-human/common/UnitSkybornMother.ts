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
	powerGiven = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			stats: {
				power: 9,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			powerGiven: this.powerGiven,
		}

		this.createSelector()
			.require(() => this.location === CardLocation.HAND)
			.requireTarget(({ target }) => target === getLastPlayedUnit())
			.requireTarget(({ target }) => target.ownerInGame === this.ownerInGame)
			.onSelected(({ target }) => onTargetSelected(target))
			.onReleased(({ target }) => onTargetReleased(target))

		const getLastPlayedUnit = () =>
			game.cardPlay.playedCards
				.filter((playedCard) => playedCard.player === this.ownerInGame)
				.filter((playedCard) => playedCard.card.location === CardLocation.BOARD)
				.reverse()[0]?.card

		const onTargetSelected = (target: ServerCard) => {
			target.buffs.addMultiple(BuffStrength, this.powerGiven, this)
		}
		const onTargetReleased = (target: ServerCard) => {
			target.buffs.remove(BuffStrength, this.powerGiven)
		}
	}
}
