import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroJomAscended from '@src/game/cards/01-arcane/legendary/AscendedOne/HeroJomAscended'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class HeroJomSovereign extends ServerCard {
	public static readonly ELEMENTALS_REQUIRED = 7
	private elementalsSummoned = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 10,
			},
			relatedCards: [HeroJomAscended],
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			elementalsRequired: HeroJomSovereign.ELEMENTALS_REQUIRED,
			inGame: () => !!this.ownerGroupNullable,
			elementalsSummoned: () => this.elementalsSummoned,
		}

		this.createLocalization({
			en: {
				name: 'Jom',
				title: 'The Sovereign',
				description:
					'If you summon {elementalsRequired} Elementals while this is in your hand, *Transform* into *Jom, The Ascended*.<if inGame><p><i>Elementals summoned: {elementalsSummoned}.</i></if>',
			},
		})

		this.createCallback(GameEventType.UNIT_CREATED, [CardLocation.HAND])
			.require(({ owner }) => owner === this.ownerGroup)
			.require(({ triggeringCard }) => triggeringCard.tribes.includes(CardTribe.ELEMENTAL))
			.perform(() => {
				this.elementalsSummoned += 1
				if (this.elementalsSummoned >= HeroJomSovereign.ELEMENTALS_REQUIRED) {
					Keywords.transformCard(this, HeroJomAscended)
				}
			})
	}
}
