import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectSpellDamage } from '@src/utils/LeaderStats'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'
import ServerDamageInstance from '@src/game/models/ServerDamageSource'
import CardTribe from '@shared/enums/CardTribe'
import BuffRowBurning from '@src/game/buffs/BuffRowBurning'

export default class ItemLabyrinthDragonsteelSword extends ServerCard {
	baseDamage = asDirectSpellDamage(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LABYRINTH_WEAPON],
			features: [CardFeature.HERO_POWER, CardFeature.LABYRINTH_ITEM_T3],
			stats: {
				cost: 3,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		const targetRowIndex = target.rowIndex
		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))
		this.game.board.rows[targetRowIndex].buffs.add(BuffRowBurning, this)
	}
}
