import BuffAlignment from '@shared/enums/BuffAlignment'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerAnimation from '@src/game/models/ServerAnimation'

import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class GwentArchgriffin extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.BEAST],
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: 'Archgriffin',
				description: 'Clear *Hazards* on its row.',
				flavor: "It's a griffin, just more… griffiny.",
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const targetRow = game.board.rows[triggeringUnit.rowIndex]
			const hazards = targetRow.buffs.buffs.filter((buff) => buff.alignment === BuffAlignment.NEGATIVE)
			if (hazards.length === 0) {
				return
			}
			game.animation.play(ServerAnimation.cardAffectsRows(this, [targetRow]))
			hazards.forEach((hazard) => targetRow.buffs.removeByReference(hazard))
		})
	}
}
