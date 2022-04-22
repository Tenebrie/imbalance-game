import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentEskelPathfinder extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Eskel: Pathfinder`,
				description: `Destroy a Bronze or Silver enemy that is not boosted.`,
				flavor: `Heard you panting from three miles away. Just didn't wanna give up that vantage point.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.require(({ targetUnit }) => targetUnit.isBronzeOrSilver)
			.require(({ targetUnit }) => targetUnit.buffs.getIntensity(BuffStrength) === 0)
			.perform(({ targetUnit }) => {
				Keywords.destroyUnit({
					unit: targetUnit,
					source: this,
				})
			})
	}
}
