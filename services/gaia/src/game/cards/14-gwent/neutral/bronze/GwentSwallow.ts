import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentSwallow extends ServerCard {
	public static readonly BONUS_POWER = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			bonusPower: GwentSwallow.BONUS_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Swallow',
				description: 'Boost a unit by {bonusPower}.',
				flavor:
					'Symbolizing spring and rejuvenation, the swallow lent its name to this potion that accelerates the rate at which wounds scab over and heal.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetUnit }) => {
				targetUnit.buffs.addMultiple(BuffStrength, GwentSwallow.BONUS_POWER, this)
			})
	}
}
