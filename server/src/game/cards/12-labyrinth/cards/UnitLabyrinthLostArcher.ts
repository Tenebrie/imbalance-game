import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import { asDirectUnitDamage } from '@src/utils/LeaderStats'
import CardTribe from '@shared/enums/CardTribe'

export default class UnitLabyrinthLostArcher extends ServerCard {
	damage = asDirectUnitDamage(7)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.LOST],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 8,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})
		this.dynamicTextVariables = {
			damage: this.damage,
		}

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.owner !== this.ownerInGame)
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(ServerDamageInstance.fromCard(this.damage, this))
			})
	}
}
