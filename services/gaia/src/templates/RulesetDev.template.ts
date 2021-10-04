import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

/**
 * This is the template file for the development ruleset definition.
 *
 * When Gaia is started (i.e. when the development environment is run), a copy of this file
 * will be created as your personal development ruleset, if it doesn't exist already.
 * Before editing, make sure you're working on `src/game/rulesets/RulesetDev.ts` file, and not
 * on the `RulesetDev.template.ts` file.
 */
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
