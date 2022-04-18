import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentMardroemeStrengthen extends ServerCard {
	public static readonly EXTRA_POWER = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ORGANIC],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			extraPower: GwentMardroemeStrengthen.EXTRA_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Envigorating Mardroeme',
				description: '*Reset* a unit and *Strengthen* it by {extraPower}.',
				flavor: `Yes, some people report feeling stronger and more powerful after ingesting them. Shame it doesn't actually affect their physical prowess...`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			const newUnit = Keywords.resetUnit(targetUnit)
			newUnit.buffs.addMultiple(BuffBaseStrength, GwentMardroemeStrengthen.EXTRA_POWER, this)
		})
	}
}
