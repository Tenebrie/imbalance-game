import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '@src/utils/Keywords'
import { AnyCardLocation } from '@src/utils/Utils'

export default class UnitMadnessIncarnate extends ServerCard {
	shatterPerRow = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			stats: {
				power: 40,
			},
			expansionSet: ExpansionSet.BASE,
			generatedArtworkMagicString: '1',
		})
		this.dynamicTextVariables = {
			shatterPerRow: this.shatterPerRow,
		}

		this.createCallback(GameEventType.GAME_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.game.board.getControlledRows(this.ownerNullable).forEach((row) => {
					this.game.animation.thread(() => {
						Keywords.shatter(this.shatterPerRow, this.ownerPlayer).on(row)
					})
				})
			})
	}
}
