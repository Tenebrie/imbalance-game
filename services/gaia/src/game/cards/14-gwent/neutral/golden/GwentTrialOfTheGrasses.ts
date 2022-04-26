import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentTrialOfTheGrasses extends ServerCard {
	public static readonly BOOST_TO = 25
	public static readonly DAMAGE = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Trial of the Grasses`,
				description: `Boost a Witcher to *${GwentTrialOfTheGrasses.BOOST_TO}* power; or Deal *${GwentTrialOfTheGrasses.DAMAGE}* damage to a non-Witcher unit. If it survives, boost it to *${GwentTrialOfTheGrasses.BOOST_TO}* power.`,
				flavor: `Imagine a lump of clay. In order to shape it, you must first moisten it or it will crumble. The Trial's initial part does just that. It opens the body to change, so to speak. Only then can the mutagens produce a witcher.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(1)
			.require(({ targetCard }) => targetCard.tribes.includes(CardTribe.WITCHER))
			.perform(({ targetUnit }) => {
				targetUnit.boostTo(GwentTrialOfTheGrasses.BOOST_TO, this)
			})

		this.createDeployTargets(TargetType.UNIT)
			.totalTargetCount(1)
			.require(({ targetCard }) => !targetCard.tribes.includes(CardTribe.WITCHER))
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentTrialOfTheGrasses.DAMAGE, this))
				if (targetUnit.isAlive) {
					targetUnit.boostTo(GwentTrialOfTheGrasses.BOOST_TO, this)
				}
			})
	}
}
