import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'
import { getRandomArrayValue } from '@src/utils/Utils'

export default class GwentRoach extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 4,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Roach',
				description: 'Whenever you play a Golden unit from your hand, *Summon* this unit to a random row.',
				flavor: 'Geralt, we gotta have a man-to-horse talk. No offense, but your riding skills? They leave a bit to be desired, buddy.',
			},
		})

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.DECK])
			.require(({ source }) => source === 'hand')
			.require(({ owner }) => owner.group.owns(this))
			.require(({ triggeringCard }) => triggeringCard.color === CardColor.GOLDEN)
			.perform(({ owner }) => {
				const validRows = game.board.getControlledRows(owner).filter((row) => !row.isFull())
				if (validRows.length === 0) {
					return
				}
				const targetRow = getRandomArrayValue(validRows)
				Keywords.summonUnitFromDeck({
					card: this,
					owner,
					rowIndex: targetRow.index,
					unitIndex: targetRow.farRightUnitIndex,
				})
			})
	}
}
