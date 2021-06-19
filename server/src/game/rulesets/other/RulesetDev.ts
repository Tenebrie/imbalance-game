import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import UnitAulerianSongwriter from '@src/game/cards/00-human/epic/UnitAulerianSongwriter'
import UnitAulerianInquisitor from '@src/game/cards/00-human/epic/UnitAulerianInquisitor'
import AIBehaviour from '@shared/enums/AIBehaviour'
import UnitRoyalTaxCollector from '@src/game/cards/00-human/epic/UnitRoyalTaxCollector'

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

		this.createBoard().player([
			[UnitAulerianSongwriter, UnitAulerianSongwriter, UnitAulerianSongwriter],
			[UnitAulerianSongwriter, UnitAulerianInquisitor, UnitAulerianSongwriter],
			[UnitStrayDog, UnitAulerianSongwriter, UnitStrayDog],
		])

		this.createDeck().fixed([LeaderMaximilian, { card: UnitRoyalTaxCollector, count: 30 }])

		this.createAI([LeaderChallengeDummy, { card: UnitStrayDog, count: 30 }]).behave(AIBehaviour.PASSIVE)
	}
}
