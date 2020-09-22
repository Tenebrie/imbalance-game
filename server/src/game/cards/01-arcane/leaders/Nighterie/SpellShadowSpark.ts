import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import CardLibrary from '../../../../libraries/CardLibrary'
import UnitShadowspawn from '../../tokens/UnitShadowspawn'
import GameEventType from '@shared/enums/GameEventType'
import CardTribe from '@shared/enums/CardTribe'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellShadowSpark extends ServerCard {
	baseDamage = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.SPARK],
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitShadowspawn],
			stats: {
				cost: 2
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: () => this.damage
		}

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.requireEnemyUnit()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard.unit!))
	}

	get damage(): number {
		return this.baseDamage
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.damage, this))

		const shadowspawn = CardLibrary.instantiateByConstructor(this.game, UnitShadowspawn)
		const targetRow = this.game.board.getRowWithDistanceToFront(this.owner!, 0)
		this.game.board.createUnit(shadowspawn, this.owner!, targetRow.index, targetRow.cards.length)
	}
}
