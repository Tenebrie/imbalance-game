import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroJomNeophyte from '@src/game/cards/01-arcane/legendary/AscendedOne/HeroJomNeophyte'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class HeroJomAspirant extends ServerCard {
	public static readonly ARMOR_REQUIRED = 5

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 10,
			},
			relatedCards: [HeroJomNeophyte],
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			armorRequired: HeroJomAspirant.ARMOR_REQUIRED,
		}

		this.createLocalization({
			en: {
				name: 'Jom',
				title: 'The Aspirant',
				description:
					'If you summon an Elemental with {armorRequired} Armor or more while this is in your hand, *Transform* into *Jom, The Neophyte*.',
			},
		})

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.HAND])
			.require(({ triggeringUnit }) => triggeringUnit.card.tribes.includes(CardTribe.ELEMENTAL))
			.require(({ triggeringUnit }) => triggeringUnit.card.stats.armor >= HeroJomAspirant.ARMOR_REQUIRED)
			.perform(() => {
				Keywords.transformCard(this, HeroJomNeophyte)
			})
	}
}
