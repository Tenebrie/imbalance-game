import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardLocation from '@shared/enums/CardLocation'
import ExpansionSet from '@shared/enums/ExpansionSet'
import {ServerCardTargetCard, ServerCardTargetUnit} from '../../../models/ServerCardTarget'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import CardFeature from '@shared/enums/CardFeature'
import {asSoloUnitDamage} from '../../../../utils/LeaderStats'
import BuffCanAttack from '../../../buffs/BuffCanAttack'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitArcheryTower extends ServerCard {
	damage = asSoloUnitDamage(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			features: [CardFeature.BUILDING],
			stats: {
				power: 3,
				armor: 7
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.damage
		}

		this.createUnitOrderTargets()
			.target(TargetType.UNIT, () => this.buffs.getIntensity(BuffCanAttack))
			.requireEnemyUnit()

		this.createEffect(GameEventType.UNIT_ORDERED_CARD)
			.perform(({ targetArguments }) => this.onAttack(targetArguments))

		this.createSelector()
			.requireTarget(({ target }) => target.location === CardLocation.BOARD)
			.requireTarget(({ target }) => target.tribes.includes(CardTribe.PEASANT))
			.requireTarget(({ target }) => this.game.board.isUnitAdjacent(this.unit, target.unit))
			.onSelected(() => this.buffs.add(BuffCanAttack, this))
			.onReleased(() => this.buffs.remove(BuffCanAttack, 1))
	}

	private onAttack(targetArguments: ServerCardTargetCard | ServerCardTargetUnit): void {
		const targetCard = targetArguments.targetCard
		targetCard.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
	}
}
