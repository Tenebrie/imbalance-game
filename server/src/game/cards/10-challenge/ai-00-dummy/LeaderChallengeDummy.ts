import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import GameEventType from '@shared/enums/GameEventType'
import CardLibrary from '../../../libraries/CardLibrary'
import TokenChallengeDummyTargetDummy from './TokenChallengeDummyTargetDummy'
import CardLocation from '@shared/enums/CardLocation'

export default class LeaderChallengeDummy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [],
			hiddenFromLibrary: true,
		})

		this.createCallback(GameEventType.ROUND_STARTED, [CardLocation.LEADER])
			.require(({ group }) => group.owns(this))
			.perform(() => this.onRoundStart())
	}

	private onRoundStart(): void {
		const middleRow = this.game.board.getRowWithDistanceToFront(this.ownerInGame, 1)
		const targetDummyCard = CardLibrary.instantiate(this.game, TokenChallengeDummyTargetDummy)
		middleRow.createUnit(targetDummyCard, this.ownerPlayerInGame, 0)
	}
}
