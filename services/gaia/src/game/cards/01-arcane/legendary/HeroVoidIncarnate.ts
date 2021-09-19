import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import LeaderStatType from '@shared/enums/LeaderStatType'
import BuffPermanentImmunity from '@src/game/buffs/BuffPermanentImmunity'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroVoidIncarnate extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.DRAGON, CardTribe.MANIFESTATION],
			stats: {
				power: 100,
				[LeaderStatType.DIRECT_SPELL_DAMAGE]: 5,
				[LeaderStatType.SPLASH_SPELL_DAMAGE]: 1,
				[LeaderStatType.RECURRING_SUMMON_COUNT]: 3,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.buffs.add(BuffPermanentImmunity, this)

		this.createLocalization({
			en: {
				name: 'Formidia',
				title: 'Void Incarnate',
				description: '*Immune*',
			},
		})
	}
}
