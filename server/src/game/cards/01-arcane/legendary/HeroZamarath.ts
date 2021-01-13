import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import BuffImmunity from '../../../buffs/BuffImmunity'
import BuffDuration from '@shared/enums/BuffDuration'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffProtector from '../../../buffs/BuffProtector'

export default class HeroZamarath extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_IMMUNITY],
			stats: {
				power: 12,
				armor: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.buffs.add(BuffProtector, this)
		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffImmunity, this, BuffDuration.START_OF_NEXT_TURN)
		})
	}
}
