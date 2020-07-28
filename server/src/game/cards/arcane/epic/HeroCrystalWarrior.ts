import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../models/ServerUnit'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'
import PostPlayTargetDefinitionBuilder from '../../../models/targetDefinitions/PostPlayTargetDefinitionBuilder'
import TargetType from '@shared/enums/TargetType'
import CardTribe from '@shared/enums/CardTribe'
import CardLibrary from '../../../libraries/CardLibrary'
import {EffectTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import ServerAnimation from '../../../models/ServerAnimation'

interface SacrificedUnit {
	rowIndex: number,
	unitIndex: number
}

export default class HeroCrystalWarrior extends ServerCard {
	sacrificedUnit: SacrificedUnit | null = null

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.SILVER, CardFaction.ARCANE)
		this.basePower = 7

		this.createCallback<EffectTargetSelectedEventArgs>(GameEventType.EFFECT_TARGET_SELECTED)
			.require(({ targetUnit }) => !!targetUnit)
			.perform(({ targetUnit }) => this.onSacrificeTargetSelected(targetUnit))

		this.createCallback<EffectTargetSelectedEventArgs>(GameEventType.EFFECT_TARGET_SELECTED)
			.require(({ targetCard}) => !!targetCard)
			.perform(({ targetCard }) => this.onCrystalSelected(targetCard))

		this.createCallback(GameEventType.EFFECT_TARGETS_CONFIRMED)
			.perform(() => this.onTargetsConfirmed())
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		if (!this.sacrificedUnit) {
			return PostPlayTargetDefinitionBuilder.base(this.game)
				.multipleTargets(2)
				.require(TargetType.UNIT)
				.alliedUnit()
				.notSelf()
		} else {
			return PostPlayTargetDefinitionBuilder.base(this.game)
				.multipleTargets(2)
				.require(TargetType.CARD_IN_LIBRARY)
				.validate(TargetType.CARD_IN_LIBRARY, args => args.targetCard.tribes.includes(CardTribe.CRYSTAL))
		}
	}

	private onCrystalSelected(target: ServerCard): void {
		const crystal = CardLibrary.instantiateByInstance(this.game, target)
		this.game.board.createUnit(crystal, this.owner, this.sacrificedUnit.rowIndex, this.sacrificedUnit.unitIndex)
	}

	private onSacrificeTargetSelected(target: ServerUnit): void {
		this.sacrificedUnit = {
			rowIndex: target.rowIndex,
			unitIndex: target.unitIndex
		}
		this.game.animation.play(ServerAnimation.cardAffectsCards(this, [target.card]))
		target.destroy()
	}

	private onTargetsConfirmed(): void {
		this.sacrificedUnit = null
	}
}
