import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

import GwentImperialManticore from '../../monster/silver/GwentImperialManticore'
import GwentManticoreVenom from './GwentManticoreVenom'

export default class GwentGloriousHunt extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.SILVER,
			tribes: [CardTribe.TACTIC],
			faction: CardFaction.NEUTRAL,
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
			relatedCards: [GwentImperialManticore, GwentManticoreVenom],
		})

		this.createLocalization({
			en: {
				name: 'Glorious Hunt',
				description: 'If losing, *Spawn* an *Imperial Manticore*. If winning or tied, *Spawn* *Manticore Venom*.',
				flavor:
					"By the gods' gonads, witcher, why'd you bring me this filth?! I want that beast's head! - that was a ploughin' figure of ploughin' speech!",
			},
		})

		this.createEffect(GameEventType.SPELL_DEPLOYED).perform(({ owner }) => {
			const ownerPower = game.board.getTotalPlayerPower(owner.group)
			const opponentPower = game.board.getTotalPlayerPower(owner.opponent)
			const cardToSpawn = ownerPower < opponentPower ? GwentImperialManticore : GwentManticoreVenom
			Keywords.createCard.for(owner).fromConstructor(cardToSpawn)
		})
	}
}
