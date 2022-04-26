import Constants from '@shared/Constants'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentDraugir from '../tokens/GwentDraugir'

export default class GwentDraug extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.CURSED, CardTribe.OFFICER],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentDraugir],
		})

		this.createLocalization({
			en: {
				name: 'Draug',
				description: '*Resurrect* units as *Draugirs* until you fill this row.',
				flavor: 'Some men cannot admit defeat. Some keep fighting from beyond the grave.',
			},
		})

		this.createDeployTargets(TargetType.CARD_IN_UNIT_GRAVEYARD)
			.targetCount(Constants.MAX_CARDS_PER_ROW)
			.requireAllied()
			.require(({ targetCard }) => targetCard.type === CardType.UNIT)
			.require(() => !!this.unit && !this.unit.boardRow.isFull())
			.perform(({ targetCard, player }) => {
				const unit = this.unit!
				player.cardGraveyard.removeCard(targetCard)
				Keywords.summonUnit({
					owner: player,
					cardConstructor: GwentDraugir,
					rowIndex: unit.rowIndex,
					unitIndex: unit.boardRow.farRightUnitIndex,
				})
			})
	}
}
