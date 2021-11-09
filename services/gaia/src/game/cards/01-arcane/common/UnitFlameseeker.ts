import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitFlamingPortal from '@src/game/cards/01-arcane/tokens/UnitFlamingPortal'
import GameEventCreators from '@src/game/models/events/GameEventCreators'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import UnitVoidPortal from '../tokens/UnitVoidPortal'

export default class UnitFlameseeker extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			relatedCards: [UnitVoidPortal, UnitFlamingPortal],
			stats: {
				power: 17,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Flameseeker',
				description: '*Deploy*:<br>*Transform* an allied *Void Portal* into a *Flaming Portal* and trigger a *Turn end* on it.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.require(({ targetUnit }) => targetUnit.card instanceof UnitVoidPortal)
			.perform(({ targetUnit }) => {
				const newUnit = Keywords.transformUnit(targetUnit, UnitFlamingPortal)
				if (!newUnit) {
					return
				}
				const event = GameEventCreators.turnEnded({ game, group: this.ownerGroup })
				Keywords.triggerEvent(newUnit.card, event)
			})
	}
}
