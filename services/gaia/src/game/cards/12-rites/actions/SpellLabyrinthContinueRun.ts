import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class SpellLabyrinthContinueRun extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			encounters: () => this.getEncounterCount(),
		}
	}

	private getEncounterCount(): number {
		if (!this.game.progression.rites.isLoaded) {
			return 0
		}
		const state = this.game.progression.rites.state.run
		return state.encounterHistory.length
	}
}
