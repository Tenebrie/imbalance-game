import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ServerUnit from '../../../../models/ServerUnit'
import CardLibrary from '../../../../libraries/CardLibrary'
import UnitShadowspawn from '../../tokens/UnitShadowspawn'
import BuffStrength from '../../../../buffs/BuffStrength'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'

export default class SpellNightmareDrain extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)
		this.basePower = 4
		this.baseFeatures = [CardFeature.HERO_POWER]

		/* Create basic unit if no target available */
		this.createEffect(GameEventType.SPELL_DEPLOYED)
			.require(() => this.game.cardPlay.getValidTargets().length === 0)
			.perform(() => {
				const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
				const targetRow = this.game.board.getRowWithDistanceToFront(this.owner, 0)
				this.game.board.createUnit(shadowspawn, this.owner, targetRow.index, targetRow.cards.length)
			})

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.validate(TargetType.UNIT, args => args.targetCard.power < args.targetCard.basePower)
	}

	private onTargetSelected(target: ServerUnit): void {
		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.owner, 0)
		const shadowspawnUnit = this.game.board.createUnit(shadowspawn, this.owner, targetRow.index, targetRow.cards.length)

		const missingHealth = target.card.basePower - target.card.power

		if (missingHealth <= 0) {
			return
		}

		for (let i = 0; i < missingHealth; i++) {
			shadowspawnUnit.buffs.add(BuffStrength, shadowspawn, BuffDuration.INFINITY)
		}
	}
}
