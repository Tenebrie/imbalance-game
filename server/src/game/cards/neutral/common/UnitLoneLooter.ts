import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import {BuffCreatedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'

export default class UnitLoneLooter extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE, CardFaction.NEUTRAL)
		this.basePower = 3
		this.baseFeatures = [CardFeature.KEYWORD_SUMMON]

		this.createCallback<BuffCreatedEventArgs>(GameEventType.BUFF_CREATED, [CardLocation.DECK])
			.require(({ triggeringBuff }) => triggeringBuff.card.owner !== this.owner)
			.require(({ triggeringBuff }) => triggeringBuff.source && triggeringBuff.source.owner === this.owner)
			.prepare(() => ({
				index: this.owner.cardDeck.unitCards.filter(unit => unit.class === this.class)
			}))
			.perform((args, preparedState) => this.onEffect(preparedState.index))
	}

	private onEffect(index: number): void {
		if (index > 0) {
			return
		}

		this.owner.summonCardFromUnitDeck(this)
	}
}
