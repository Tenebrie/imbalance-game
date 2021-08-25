import Constants from '@shared/Constants'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderTheScavenger from '@src/game/cards/09-neutral/leaders/TheScavenger/LeaderTheScavenger'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import HeroChallengeLegendaryExplorer0 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer0'
import HeroChallengeLegendaryExplorer1 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer1'
import HeroChallengeLegendaryExplorer2 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer2'
import HeroChallengeLegendaryExplorer3 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer3'
import UnitChallengeEagerExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeEagerExplorer'
import UnitChallengeScarredExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeScarredExplorer'
import AIBehaviour from '@shared/enums/AIBehaviour'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import UnitChallengeDummyExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeDummyExplorer'

export default class RulesetCoopBrawlDiscovery extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.COOP,
			category: RulesetCategory.COOP,
			sortPriority: 3,
		})

		const playerDeck = [
			LeaderTheScavenger,
			HeroChallengeLegendaryExplorer0,
			HeroChallengeLegendaryExplorer1,
			HeroChallengeLegendaryExplorer2,
			HeroChallengeLegendaryExplorer3,
			{ card: UnitChallengeScarredExplorer, count: Constants.CARD_LIMIT_SILVER },
			{ card: UnitChallengeEagerExplorer, count: Constants.CARD_LIMIT_BRONZE },
		]
		this.createSlots()
			.addGroup([
				{
					type: 'player',
					deck: playerDeck,
				},
				{
					type: 'player',
					deck: playerDeck,
				},
			])
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderChallengeDummy, { card: UnitChallengeDummyExplorer, count: Constants.CARD_LIMIT_TOTAL - 1 }],
			})
	}
}
