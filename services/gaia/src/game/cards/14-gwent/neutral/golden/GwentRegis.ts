import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentRegis extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 1,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Regis`,
				description: `*Drain* all boosts from a unit.`,
				flavor: `Men, the polite ones, at least, would call me a monster. A blood-drinking freak.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetUnit }) => targetUnit.buffs.getIntensity(BuffStrength) > 0)
			.perform(({ targetUnit }) => {
				const totalBoost = targetUnit.buffs.getIntensity(BuffStrength)
				targetUnit.buffs.removeAll(BuffStrength, this)
				this.boostBy(totalBoost, targetUnit.card, 'stagger')
			})
	}
}
