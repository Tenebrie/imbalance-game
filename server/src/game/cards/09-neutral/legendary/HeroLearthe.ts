import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '../../../models/ServerBoardRow'
import CardFaction from '@shared/enums/CardFaction'
import {CardTargetSelectedEventArgs} from '../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import Constants from '@shared/Constants'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitLivingShadow from '../tokens/UnitLivingShadow'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class HeroLearthe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitLivingShadow],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.BOARD_ROW)

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	private onTargetSelected(target: ServerBoardRow): void {
		for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
			const livingShadow = CardLibrary.instantiateByConstructor(this.game, UnitLivingShadow)
			this.game.board.createUnit(livingShadow, target.owner, target.index, target.cards.length)
		}
	}
}
