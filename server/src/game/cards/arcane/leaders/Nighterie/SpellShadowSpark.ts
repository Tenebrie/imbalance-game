import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import BuffSparksExtraDamage from '../../../../buffs/BuffSparksExtraDamage'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import CardLibrary from '../../../../libraries/CardLibrary'
import UnitShadowspawn from '../../tokens/UnitShadowspawn'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'

export default class SpellShadowSpark extends ServerCard {
	baseDamage = 2

	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 2
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			damage: () => this.damage
		}

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	get damage(): number {
		return this.baseDamage + this.game.getTotalBuffIntensityForPlayer(BuffSparksExtraDamage, this.owner)
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.UNIT)
			.enemyUnit()
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))

		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.owner, 0)
		this.game.board.createUnit(shadowspawn, this.owner, targetRow.index, targetRow.cards.length)
	}
}
