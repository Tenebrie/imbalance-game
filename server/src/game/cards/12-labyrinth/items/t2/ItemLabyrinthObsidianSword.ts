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

export default class ItemLabyrinthObsidianSword extends ServerCard {
	baseDamage = asDirectSpellDamage(5)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LABYRINTH_WEAPON],
			features: [CardFeature.HERO_POWER, CardFeature.LABYRINTH_ITEM_T2],
			stats: {
				cost: 1,
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
		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))
	}
}
