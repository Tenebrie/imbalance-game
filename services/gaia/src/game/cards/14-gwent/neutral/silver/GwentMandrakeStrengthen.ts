import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffBaseStrength from '@src/game/buffs/BuffBaseStrength'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

import GwentMandrake from './GwentMandrake'

export default class GwentMandrakeStrengthen extends ServerCard {
	public static readonly EXTRA_POWER = 6

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
			relatedCards: [GwentMandrake],
			hiddenFromLibrary: true,
		})

		this.createLocalization({
			en: {
				name: 'Envigorating Mandrake',
				description: `*Heal* a unit and *Strengthen* it by *${GwentMandrakeStrengthen.EXTRA_POWER}*.`,
				flavor: `Yes, some people report feeling stronger and more powerful after ingesting it. Shame it doesn't actually affect their physical prowess...`,
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetUnit }) => {
			targetUnit.heal(DamageInstance.fromCard(1000, this))
			targetUnit.buffs.addMultiple(BuffBaseStrength, GwentMandrakeStrengthen.EXTRA_POWER, this)
		})
	}
}
