import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import HeroJomSovereign from '@src/game/cards/01-arcane/legendary/AscendedOne/HeroJomSovereign'
import Keywords from '@src/utils/Keywords'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

// TODO: Fix triggering on new round start
export default class HeroJomNeophyte extends ServerCard {
	public static readonly MANA_REQUIRED = 3
	private manaGenerated = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 10,
			},
			relatedCards: [HeroJomSovereign],
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			manaRequired: HeroJomNeophyte.MANA_REQUIRED,
			inGame: () => !!this.ownerGroupNullable,
			manaGenerated: () => this.manaGenerated,
		}

		this.createLocalization({
			en: {
				name: 'Jom',
				title: 'The Neophyte',
				description:
					'If you generate {manaRequired} Mana while this is in your hand, *Transform* into *Jom, The Sovereign*.<if inGame><p><i>Mana generated: {manaGenerated}.</i></if>',
			},
		})

		this.createCallback(GameEventType.SPELL_MANA_GENERATED, [CardLocation.HAND])
			.require(({ player }) => player.group === this.ownerGroup)
			.perform(({ count }) => {
				this.manaGenerated += count
				if (this.manaGenerated >= HeroJomNeophyte.MANA_REQUIRED) {
					Keywords.transformCard(this, HeroJomSovereign)
				}
			})
	}
}
