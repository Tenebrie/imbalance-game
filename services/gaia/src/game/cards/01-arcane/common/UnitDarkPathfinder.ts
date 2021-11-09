import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import UnitAbyssPortal from '@src/game/cards/01-arcane/tokens/UnitAbyssPortal'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import UnitVoidPortal from '../tokens/UnitVoidPortal'

export default class UnitDarkPathfinder extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitVoidPortal, UnitAbyssPortal],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})

		this.createLocalization({
			en: {
				name: 'Dark Pathfinder',
				description: '*Deploy*:\n*Shatter* a row to transform a *Void Portal* into an *Abyss Portal*.',
			},
		})

		// TODO: Finish me!
		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			Keywords.createCard.forOwnerOf(this).fromConstructor(UnitVoidPortal)
		})
	}
}
