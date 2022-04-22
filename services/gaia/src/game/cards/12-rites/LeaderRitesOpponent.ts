import BuffDuration from '@shared/enums/BuffDuration'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffRitesAttackingNextTurn from '@src/game/buffs/12-rites/BuffRitesAttackingNextTurn'
import BuffRitesAttackingThisTurn from '@src/game/buffs/12-rites/BuffRitesAttackingThisTurn'
import BuffRitesOnCooldown from '@src/game/buffs/12-rites/BuffRitesOnCooldown'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import ServerUnit from '@src/game/models/ServerUnit'
import { getLeaderTextVariables, plurifyEnding, shuffle } from '@src/utils/Utils'

export default class LeaderRitesOpponent extends ServerCard {
	private movesPerTurn = 2
	private currentTurnMoves: ServerUnit[] = []
	private nextTurnMoves: ServerUnit[] = []

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.NEUTRAL,
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
			moveCount: () => this.movesPerTurn,
			pluralizedMoveCount: () => plurifyEnding(this.movesPerTurn, 'action'),
		}

		this.createLocalization({
			en: {
				name: 'The Opponent',
				title: 'Your opponent',
				description: 'Performs {moveCount} *{pluralizedMoveCount}* per turn.',
			},
		})

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.LEADER])
			.require(({ group }) => !group.owns(this))
			.perform(() => {
				const hasForesightArtifact = false

				this.currentTurnMoves.forEach((unit) => {
					unit.buffs.add(BuffRitesOnCooldown, this, BuffDuration.END_OF_THIS_TURN)
				})

				if (hasForesightArtifact && this.nextTurnMoves.length > 0) {
					this.currentTurnMoves = this.nextTurnMoves
				} else if (!hasForesightArtifact) {
					this.currentTurnMoves = []
				}
				this.nextTurnMoves = []

				let newMoves: ServerUnit[] = []

				const activeAllies = game.board
					.getSplashableUnitsFor(this.ownerGroup)
					.filter((unit) => unit.card.features.includes(CardFeature.RITES_ACTIVE_ENEMY))
					.filter((unit) => !unit.card.features.includes(CardFeature.RITES_UNIT_COOLDOWN))
					.filter((unit) => !this.currentTurnMoves.includes(unit))

				const shuffledAllies = shuffle(activeAllies)
				newMoves = shuffledAllies.slice(0, this.movesPerTurn)

				if (hasForesightArtifact) {
					this.nextTurnMoves = newMoves
				} else {
					this.currentTurnMoves = newMoves
				}
			})

		this.createSelector()
			.requireTarget(({ target }) => this.currentTurnMoves.map((unit) => unit.card).includes(target))
			.provide(BuffRitesAttackingThisTurn)

		this.createSelector()
			.requireTarget(({ target }) => this.nextTurnMoves.map((unit) => unit.card).includes(target))
			.provide(BuffRitesAttackingNextTurn)
	}
}
