import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import TargetType from '@shared/enums/TargetType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardFeature from '@shared/enums/CardFeature'
import GameEventType from '@shared/enums/GameEventType'
import { AnyCardLocation } from '../../../../utils/Utils'
import BuffNightwatch from '../../../buffs/BuffNightwatch'

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
			features: [CardFeature.BUILDING, CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_NIGHTWATCH],
			stats: {
				power: 0,
				armor: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createDeployEffectTargets()
			.target(TargetType.UNIT)
			.require(TargetType.UNIT, ({ targetCard }) => targetCard.color === CardColor.BRONZE || targetCard.color === CardColor.SILVER)
			.require(TargetType.UNIT, ({ targetCard }) => !targetCard.features.includes(CardFeature.BUILDING))
			.requireAlliedUnit()

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