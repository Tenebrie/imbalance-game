import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class SpellLabyrinthPreviousRun extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.PASSIVE],
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
		const state = this.game.progression.rites.state.lastRun
		return state ? state.encounterHistory.length : 0
	}
}
