import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { AnyCardLocation } from '@src/utils/Utils'

export default class UnitMadnessIncarnate extends ServerCard {
	shatterPerRow = 2

	// TODO: Why am I still here?
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			tribes: [CardTribe.MANIFESTATION],
			stats: {
				power: 40,
			},
			expansionSet: ExpansionSet.BASE,
			generatedArtworkMagicString: '1',
			isExperimental: true,
		})
		this.dynamicTextVariables = {
			shatterPerRow: this.shatterPerRow,
		}

		this.createCallback(GameEventType.GAME_STARTED, AnyCardLocation)
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.game.board.getControlledRows(this.ownerPlayerNullable).forEach((row) => {
					this.game.animation.thread(() => {
						Keywords.shatter(this.shatterPerRow, this.ownerPlayer).on(row)
					})
				})
			})
	}
}
