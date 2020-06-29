import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import GameEvent, {CardTakesDamageEventOverrideArgs} from '../../../models/GameEvent'
import CardLocation from '@shared/enums/CardLocation'

export default class HeroAntoria extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.GOLDEN, CardFaction.CASTLE)
		this.basePower = 15
		this.baseTribes = [CardTribe.VALKYRIE]

		this.subscribe<CardTakesDamageEventOverrideArgs>(GameEvent.CARD_TAKES_DAMAGE)
			.requireLocation(CardLocation.HAND)
			.require(({ targetCard }) => targetCard.location === CardLocation.BOARD)
			.require(({ targetCard }) => targetCard.owner === this.owner)
			.override(args => ({
				...args,
				targetCard: this
			}))
	}
}
