import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'

export default class UnitLoneLooter extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_SUMMON],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createCallback(GameEventType.BUFF_CREATED, [CardLocation.DECK])
			.require(({ triggeringBuff }) => triggeringBuff.card.owner !== this.owner)
			.require(({ triggeringBuff }) => triggeringBuff.source?.owner === this.owner)
			.prepare(() => ({
				index: this.owner!.cardDeck.unitCards.filter(unit => unit.class === this.class)
			}))
			.perform((args, preparedState) => this.onEffect(preparedState.index))
	}

	private onEffect(index: number): void {
		if (index > 0) {
			return
		}

		Keywords.summonCard(this)
	}
}
