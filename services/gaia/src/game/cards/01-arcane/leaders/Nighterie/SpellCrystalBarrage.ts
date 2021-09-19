import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'

import CardLibrary from '../../../../libraries/CardLibrary'
import ServerBoardRow from '../../../../models/ServerBoardRow'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import UnitVolatileCrystal from '../../tokens/UnitVolatileCrystal'

export default class SpellCrystalBarrage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitVolatileCrystal],
			stats: {
				cost: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Crystal Barrage',
				description: 'Choose an enemy row.<p>Summon *Volatile Crystals* around every unit on this row.',
			},
		})

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ player, targetRow }) => this.onTargetSelected(player, targetRow))
	}

	private onTargetSelected(player: ServerPlayerInGame, target: ServerBoardRow): void {
		for (let i = 0; i <= target.cards.length; i += 2) {
			if (target.cards.length >= Constants.MAX_CARDS_PER_ROW) {
				break
			}

			const crystal = CardLibrary.instantiate(this.game, UnitVolatileCrystal)
			this.game.animation.thread(() => {
				this.game.board.createUnit(crystal, player, target.index, i)
			})
		}
	}
}
