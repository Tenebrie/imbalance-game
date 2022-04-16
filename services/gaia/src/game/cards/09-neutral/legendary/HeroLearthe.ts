import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import CardLibrary from '../../../libraries/CardLibrary'
import ServerBoardRow from '../../../models/ServerBoardRow'
import UnitHarmlessShadow from '../tokens/UnitHarmlessShadow'

export default class HeroLearthe extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			relatedCards: [UnitHarmlessShadow],
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
			const livingShadow = CardLibrary.instantiate(this.game, UnitHarmlessShadow)
			const owner = target.owner === this.ownerGroup ? player : this.ownerGroup.opponent.players[0]
			this.game.board.createUnit(livingShadow, owner, target.index, target.cards.length)
			this.game.animation.commitAnimationThread()
		}
	}
}
