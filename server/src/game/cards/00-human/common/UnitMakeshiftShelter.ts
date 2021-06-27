import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation } from '@src/utils/Utils'
import BuffNightwatch from '../../../buffs/BuffNightwatch'
import CardTribe from '@shared/enums/CardTribe'

type SelectedUnit = {
	card: ServerCard
	roundIndex: number
}

export default class UnitMakeshiftShelter extends ServerCard {
	selectedUnit: SelectedUnit | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.BUILDING],
			features: [CardFeature.NIGHTWATCH, CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 0,
				armor: 6,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployTargets(TargetType.UNIT)
			.require(({ targetCard }) => targetCard.color === CardColor.BRONZE || targetCard.color === CardColor.SILVER)
			.require(({ targetCard }) => !targetCard.features.includes(CardFeature.BUILDING))
			.requireAllied()

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => {
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
