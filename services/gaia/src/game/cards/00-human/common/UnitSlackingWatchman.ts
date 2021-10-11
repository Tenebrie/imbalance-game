import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import TargetType from '@shared/enums/TargetType'
import { AnyCardLocation } from '@src/utils/Utils'

import BuffNightwatch from '../../../buffs/BuffNightwatch'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

type SelectedUnit = {
	card: ServerCard
	roundIndex: number
}

export default class UnitSlackingWatchman extends ServerCard {
	selectedUnit: SelectedUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.COMMONER, CardTribe.SOLDIER],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_NIGHTWATCH],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Slacking Watchman',
				description:
					'*Deploy:*\nChoose another allied unit.\nIt has *Nightwatch* until the end of this round, as long as this is on the board.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.perform(({ targetCard }) => {
				this.selectedUnit = {
					card: targetCard,
					roundIndex: this.game.roundIndex,
				}
			})

		// Target is destroyed -> clear selection
		this.createCallback(GameEventType.UNIT_DESTROYED, AnyCardLocation)
			.require(({ triggeringCard }) => triggeringCard === this.selectedUnit?.card)
			.perform(() => {
				this.selectedUnit = null
			})

		// This is destroyed -> clear selection
		this.createEffect(GameEventType.UNIT_DESTROYED).perform(() => {
			this.selectedUnit = null
		})

		// New round started -> clear selection
		this.createCallback(GameEventType.ROUND_STARTED, AnyCardLocation).perform(() => {
			this.selectedUnit = null
		})

		this.createSelector()
			.require(() => this.selectedUnit !== null && this.selectedUnit.roundIndex === this.game.roundIndex)
			.requireTarget(({ target }) => target === this.selectedUnit?.card)
			.provide(BuffNightwatch)
	}
}
