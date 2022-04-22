import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentMahakamHornStrength extends ServerCard {
	public static readonly BOOST = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.ITEM, CardTribe.DOOMED],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			boost: GwentMahakamHornStrength.BOOST,
		}

		this.createLocalization({
			en: {
				name: 'Dwarven Call to Strength',
				description: '*Strengthen* a unit by {boost}.',
				flavor: 'This call invigorates even the most deadly wounded.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.perform(({ targetCard }) => {
				targetCard.buffs.addMultiple(BuffBaseStrength, GwentMahakamHornStrength.BOOST, this)
			})
	}
}
