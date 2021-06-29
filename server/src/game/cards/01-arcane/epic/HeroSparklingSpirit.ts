import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEventType from '@shared/enums/GameEventType'
import SpellFleetingSpark from '../tokens/SpellFleetingSpark'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import LeaderStatType from '@shared/enums/LeaderStatType'

export default class HeroSparklingSpirit extends ServerCard {
	infuseCost = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			relatedCards: [SpellFleetingSpark],
			stats: {
				power: 16,
				[LeaderStatType.SPARK_DAMAGE]: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.addRelatedCards().requireTribe(CardTribe.SPARK)
		this.dynamicTextVariables = {
			infuseCost: this.infuseCost,
			extraDamage: this.stats.leaderStats[LeaderStatType.SPARK_DAMAGE],
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.requireImmediate(({ owner }) => owner.spellMana >= this.infuseCost)
			.perform(() => onDeploy())
		const onDeploy = (): void => {
			Keywords.infuse(this, this.infuseCost)
			Keywords.createCard.forOwnerOf(this).fromConstructor(SpellFleetingSpark)
		}
	}
}
