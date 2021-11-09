import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'

import BuffImmunity from '../../../buffs/BuffImmunity'
import BuffProtector from '../../../buffs/BuffProtector'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			stats: {
				power: 24,
				armor: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.buffs.add(BuffProtector, this)
		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffImmunity, this, BuffDuration.START_OF_NEXT_TURN)
		})
	}
}
