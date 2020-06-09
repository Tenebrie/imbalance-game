import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ServerBuff from '../../../models/ServerBuff'
import ServerOwnedCard from '../../../models/ServerOwnedCard'
import CardLocation from '@shared/enums/CardLocation'

export default class UnitLoneLooter extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 3
	}

	onOtherCardReceivedNewBuff(otherCard: ServerOwnedCard, buff: ServerBuff): void {
		if (this.location !== CardLocation.DECK || otherCard.owner === this.owner || !buff.source || buff.source.owner !== this.owner) {
			return
		}

		const loneLooters = this.owner.cardDeck.unitCards.filter(unit => unit.class === this.class)
		if (loneLooters.indexOf(this) < loneLooters.length - 1) {
			return
		}

		this.owner.summonCardFromUnitDeck(this)
	}
}
