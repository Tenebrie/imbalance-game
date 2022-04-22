import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentOlgierdVonEverec extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.REDANIA, CardTribe.CURSED],
			features: [CardFeature.HAS_DEATHWISH],
			stats: {
				power: 5,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Olgierd von Everec`,
				description: `*Deathwish*: *Resurrect* this unit on a random row.`,
				flavor: `At least you now know I don't easily lose my head.`,
			},
		})

		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED)
			.require(() => !this.unit)
			.perform(({ owner }) => {
				const targetRow = game.board.getRandomNonEmptyRow(owner)
				if (!targetRow) {
					return
				}

				Keywords.summonUnitFromGraveyard({
					card: this,
					owner,
					rowIndex: targetRow.index,
					unitIndex: targetRow.farRightUnitIndex,
				})
			})
	}
}
