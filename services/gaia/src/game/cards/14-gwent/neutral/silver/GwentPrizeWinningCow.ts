import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

import GwentChort from '../bronze/GwentChort'

export default class GwentPrizeWinningCow extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST],
			features: [CardFeature.HAS_DEATHWISH],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentChort],
		})

		this.createLocalization({
			en: {
				name: 'Prize-Winning Cow',
				description: '*Deathwish:* *Spawn* a *Chort* on a random row.',
				flavor: 'Mooooo. Moo?',
			},
		})

		this.createEffect(GameEventType.AFTER_UNIT_DESTROYED)
			.require(({ reason }) => reason === UnitDestructionReason.CARD_EFFECT)
			.perform(({ owner }) => {
				const validRows = game.board.getControlledRows(owner).filter((row) => !row.isFull())
				const targetRow = getRandomArrayValue(validRows)
				if (!targetRow) {
					return
				}
				Keywords.summonUnit({
					cardConstructor: GwentChort,
					owner,
					rowIndex: targetRow.index,
					unitIndex: targetRow.farRightUnitIndex,
				})
			})
	}
}
