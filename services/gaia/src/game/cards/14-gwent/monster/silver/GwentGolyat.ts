import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import { DamageInstance } from '@src/game/models/ServerDamageSource'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentGolyat extends ServerCard {
	public static readonly STARTING_BOOST = 7
	public static readonly EXTRA_DAMAGE = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.OGROID],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			startingBoost: GwentGolyat.STARTING_BOOST,
			extraDamage: GwentGolyat.EXTRA_DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Golyat',
				description: `Boost self by {startingBoost}.<p>Whenever this unit is damaged, deal {extraDamage} damage to self.`,
				flavor:
					'Some claim Golyat was once a famous knight. Sadly, one day he earned the wrath of the Lady of the Lake, who turned him into a monster.',
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.addMultiple(BuffStrength, GwentGolyat.STARTING_BOOST, this)
		})

		this.createEffect(GameEventType.CARD_TAKES_DAMAGE).perform(() => {
			this.dealDamage(DamageInstance.fromCard(GwentGolyat.EXTRA_DAMAGE, this))
		})
	}
}
