import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffExtraArmor from '@src/game/buffs/BuffExtraArmor'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentThunderbolt extends ServerCard {
	public static readonly BONUS_POWER = 3
	public static readonly BONUS_ARMOR = 2

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
			bonusPower: GwentThunderbolt.BONUS_POWER,
			bonusArmor: GwentThunderbolt.BONUS_ARMOR,
		}

		this.createLocalization({
			en: {
				name: 'Thunderbolt',
				description: 'Boost *3* adjacent units by {bonusPower} and give them {bonusArmor} Armor.',
				flavor: "The witcher's face changed… his mien turning inhuman, horrifying.",
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(targetUnit)
				const targets = [targetUnit].concat(adjacentUnits)
				targets.forEach((unit) => {
					game.animation.instantThread(() => {
						unit.buffs.addMultiple(BuffStrength, GwentThunderbolt.BONUS_POWER, this)
						unit.buffs.addMultiple(BuffExtraArmor, GwentThunderbolt.BONUS_ARMOR, this)
					})
				})
				game.animation.syncAnimationThreads()
			})
	}
}
