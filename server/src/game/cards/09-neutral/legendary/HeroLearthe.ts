import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '../../../models/ServerBoardRow'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import Constants from '@shared/Constants'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitLivingShadow from '../tokens/UnitLivingShadow'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

export default class HeroLearthe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitLivingShadow],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require((args) => !!args.targetRow.owner)
			.perform(({ player, targetRow }) => this.onTargetSelected(player, targetRow))
	}

	private onTargetSelected(player: ServerPlayerInGame, target: ServerBoardRow): void {
		for (let i = 0; i < Constants.MAX_CARDS_PER_ROW; i++) {
			this.game.animation.createAnimationThread()
			const livingShadow = CardLibrary.instantiate(this.game, UnitLivingShadow)
			this.game.board.createUnit(livingShadow, player, target.index, target.cards.length)
			this.game.animation.commitAnimationThread()
		}
	}
}
