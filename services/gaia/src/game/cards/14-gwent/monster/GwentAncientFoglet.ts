import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentRowFog from '@src/game/buffs/14-gwent/BuffGwentRowFog'
import BuffStrength from '@src/game/buffs/BuffStrength'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentAncientFoglet extends ServerCard {
	public static readonly BONUS_POWER = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.NECROPHAGE],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			bonusPower: GwentAncientFoglet.BONUS_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Ancient Foglet',
				description: 'Boost by {bonusPower} if *Impenetrable Fog* is on the board on turn end.',
				flavor: 'Many primal fears lurk in the hearts of men. The fear of the mist is well-founded…',
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.require(() => game.board.rows.some((row) => row.buffs.has(BuffGwentRowFog)))
			.perform(() => {
				this.buffs.addMultiple(BuffStrength, GwentAncientFoglet.BONUS_POWER, this)
			})
	}
}
