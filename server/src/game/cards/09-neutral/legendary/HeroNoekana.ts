import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffStrength from '../../../buffs/BuffStrength'
import {asMassBuffPotency} from '../../../../utils/LeaderStats'
import CardLocation from '@shared/enums/CardLocation'

export default class HeroNoekana extends ServerCard {
	strengthGiven = asMassBuffPotency(1)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true
		})
		this.dynamicTextVariables = {
			strengthGiven: this.strengthGiven
		}

		this.createSelector()
			.require(() => this.location === CardLocation.BOARD)
			.require(({ target }) => target.location === CardLocation.BOARD)
			.onSelected(({ target }) => this.onSelected(target))
			.onReleased(({ target }) => this.onReleased(target))
	}

	private onSelected(card: ServerCard): void {
		card.buffs.add(BuffStrength, this)
	}

	private onReleased(card: ServerCard): void {
		card.buffs.remove(BuffStrength, 1)
	}
}
