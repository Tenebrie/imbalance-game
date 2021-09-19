import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import UnitHelplessPeasants from '@src/game/cards/00-human/common/UnitHelplessPeasants'
import UnitGatewayGuardian from '@src/game/cards/01-arcane/epic/UnitGatewayGuardian'
import LeaderNighterie from '@src/game/cards/01-arcane/leaders/Nighterie/LeaderNighterie'
import LeaderVelElleron from '@src/game/cards/01-arcane/leaders/VelElleron/LeaderVelElleron'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetDev extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: false,
			},
		})

		this.createBoard().player([
			[UnitGatewayGuardian, UnitGatewayGuardian, UnitGatewayGuardian, UnitGatewayGuardian],
			[UnitHelplessPeasants, UnitHelplessPeasants, UnitHelplessPeasants, UnitHelplessPeasants],
			[UnitHelplessPeasants, UnitHelplessPeasants, UnitHelplessPeasants, UnitHelplessPeasants],
		])

		this.createSlots()
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderNighterie, { card: UnitHelplessPeasants, count: 30 }],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderVelElleron, { card: UnitChallengeDummyVanillaWarrior, count: 30 }],
			})
	}
}
