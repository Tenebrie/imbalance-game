import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseWeakness from '@src/game/buffs/BuffBaseWeakness'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentMandrake from './GwentMandrake'

export default class GwentMandrakeWeaken extends ServerCard {
	public static readonly WEAKEN = 6

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC, CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentMandrake],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Enfeebling Mandrake',
				description: `*Reset* a unit and *Weaken* it by *${GwentMandrakeWeaken.WEAKEN}*.`,
				flavor: `You may feel dizziness, drowsiness and, eventually, deathiness.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			const newUnit = Keywords.resetUnit(targetUnit)
			newUnit.buffs.addMultiple(BuffBaseWeakness, GwentMandrakeWeaken.WEAKEN, this)
		})
	}
}
