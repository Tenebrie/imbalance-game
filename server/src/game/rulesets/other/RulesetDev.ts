import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import AIBehaviour from '@shared/enums/AIBehaviour'
import UnitMasterSwordsmith from '@src/game/cards/00-human/common/UnitMasterSwordsmith'

export default class RulesetDev extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
		})

		this.createDeck().fixed([LeaderMaximilian, { card: UnitMasterSwordsmith, count: 30 }])

		this.createAI([LeaderChallengeDummy, { card: UnitStrayDog, count: 30 }]).behave(AIBehaviour.PASSIVE)
	}
}
