import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import ServerUnit from '../../../models/ServerUnit'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import ServerAnimation from '../../../models/ServerAnimation'
import CardFeature from '@shared/enums/CardFeature'
import BotCardEvaluation from '../../../AI/BotCardEvaluation'

export default class UnitPriestessOfAedine extends ServerCard {
	targets = 1
	healing = 5

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 8
		this.baseAttackRange = 1
		this.baseTribes = [CardTribe.HUMAN]
		this.dynamicTextVariables = {
			targets: this.targets,
			healing: this.healing
		}
		this.baseFeatures = [CardFeature.KEYWORD_DEPLOY]
		this.botEvaluation = new CustomBotEvaluation(this)

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.multipleTargets(this.targets)
			.alliedUnit()
			.notSelf()
			.allow(TargetType.UNIT, this.targets)
			.unique(TargetType.UNIT)
			.label(TargetType.UNIT, 'card.unitPriestessOfAedine.target.heal')
			.validate(TargetType.UNIT, args => args.targetUnit.card.power < args.targetUnit.card.basePower)
	}

	private onTargetSelected(target: ServerUnit): void {
		this.game.animation.play(ServerAnimation.cardHealsCards(this, [target.card]))
		target.heal(ServerDamageInstance.fromUnit(this.healing, this.unit))
	}
}

class CustomBotEvaluation extends BotCardEvaluation {
	get expectedValue(): number {
		const alliedUnits = this.game.board.getUnitsOwnedByPlayer(this.card.owner)
		const highestMissingPower = alliedUnits
			.filter(unit => unit !== this.card.unit)
			.map(unit => unit.card)
			.map(card => card.maxPower - card.power)
			.sort((a, b) => b - a)[0]

		return this.card.power + highestMissingPower
	}
}
