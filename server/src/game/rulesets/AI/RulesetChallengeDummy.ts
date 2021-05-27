import Constants from '@src/../../shared/src/Constants'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import GameMode from '@src/../../shared/src/enums/GameMode'
import BuffStrength from '@src/game/buffs/BuffStrength'
import UnitUrbanAmbusher from '@src/game/cards/00-human/common/UnitUrbanAmbusher'
import UnitAulerianSongwriter from '@src/game/cards/00-human/epic/UnitAulerianSongwriter'
import UnitBloodyTrebuchet from '@src/game/cards/00-human/epic/UnitBloodyTrebuchet'
import UnitArcaneElemental from '@src/game/cards/01-arcane/common/UnitArcaneElemental'
import UnitEnergyRelay from '@src/game/cards/01-arcane/common/UnitEnergyRelay'
import HeroJom from '@src/game/cards/01-arcane/legendary/HeroJom'
import UnitAbyssPortal from '@src/game/cards/01-arcane/tokens/UnitAbyssPortal'
import UnitEndlessArmy from '@src/game/cards/09-neutral/common/UnitEndlessArmy'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'

export default class RulesetChallengeDummy extends ServerRulesetBuilder {
	constructor() {
		super({
			gameMode: GameMode.VS_AI,
		})

		this.updateConstants({
			UNIT_HAND_SIZE_STARTING: 25,
		})

		this.createDeck().fixed([LeaderChallengeDummy, { card: UnitEndlessArmy, count: Constants.CARD_LIMIT_TOTAL - 1 }])

		this.createBoard()
			.player([[], [UnitAbyssPortal]])
			.opponent([[], [HeroJom]])
			.symmetric([[UnitStrayDog, UnitStrayDog, UnitStrayDog], []])

		this.createAI([
			LeaderChallengeDummy,
			UnitArcaneElemental,
			UnitBloodyTrebuchet,
			UnitAulerianSongwriter,
			{ card: UnitUrbanAmbusher, count: 2 },
			{ card: UnitEnergyRelay, count: 2 },
			{ card: UnitEndlessArmy, count: 3 },
		])

		// TODO: `this.createWinCondition()`

		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.unitIndex === 0)
			.perform(({ triggeringUnit }) => triggeringUnit.buffs.add(BuffStrength, null))
	}
}
