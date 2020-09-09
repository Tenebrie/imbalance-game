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
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellNightmareDrain extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitShadowspawn],
			stats: {
				cost: 4
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.require(TargetType.UNIT, args => args.targetCard.stats.power < args.targetCard.stats.basePower)

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

	private onTargetSelected(target: ServerUnit): void {
		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.owner, 0)
		const shadowspawnUnit = this.game.board.createUnit(shadowspawn, this.owner, targetRow.index, targetRow.cards.length)

		const missingHealth = target.card.stats.basePower - target.card.stats.power
		shadowspawnUnit.buffs.addMultiple(BuffStrength, missingHealth, shadowspawn, BuffDuration.INFINITY)
	}
}
