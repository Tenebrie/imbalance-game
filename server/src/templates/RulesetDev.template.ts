import Constants from '@shared/Constants'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import AIBehaviour from '@shared/enums/AIBehaviour'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'

export default class RulesetDev extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderMaximilian, { card: UnitChallengeDummyVanillaWarrior, count: Constants.CARD_LIMIT_BRONZE }],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderChallengeDummy, { card: UnitChallengeDummyVanillaWarrior, count: Constants.CARD_LIMIT_BRONZE }],
			})
	}
}
