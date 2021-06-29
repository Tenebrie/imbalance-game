import { v4 as getRandomId } from 'uuid'
import ServerGame from '../models/ServerGame'
import ServerCard from '../models/ServerCard'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import PlayerGroup from '@shared/models/PlayerGroup'
import GameEventCreators from '@src/game/models/events/GameEventCreators'
import CardFeature from '@shared/enums/CardFeature'
import { RulesetSlotGroup } from '@shared/models/ruleset/RulesetSlots'
import ServerPlayerGroupSlots from '@src/game/players/ServerPlayerGroupSlots'
import { ServerCardBuff, ServerRowBuff } from '@src/game/models/buffs/ServerBuff'

export default class ServerPlayerGroup implements PlayerGroup {
	id: string
	game: ServerGame
	slots: ServerPlayerGroupSlots
	players: ServerPlayerInGame[]
	roundWins: number
	turnEnded: boolean
	roundEnded: boolean

	constructor(game: ServerGame, slots: RulesetSlotGroup) {
		this.id = getRandomId()
		this.game = game
		this.slots = new ServerPlayerGroupSlots(this, slots)
		this.players = []
		this.roundWins = 0
		this.turnEnded = true
		this.roundEnded = true
	}

	public get openHumanSlots(): number {
		return this.slots.openHumanSlots
	}

	public get openBotSlots(): number {
		return this.slots.openBotSlots
	}

	public get username(): string {
		return this.players.map((playerInGame) => playerInGame.player.username).join(', ')
	}

	public get opponent(): ServerPlayerGroup {
		return this.game.getOpponent(this)
	}

	public isInvertedBoard(): boolean {
		return this.players.some((player) => player.isInvertedBoard())
	}

	public get isHuman(): boolean {
		return this.players.every((player) => player.isHuman)
	}

	public get isBot(): boolean {
		return this.players.some((player) => player.isBot)
	}

	public owns(card: ServerCard | ServerCardBuff | ServerRowBuff): boolean {
		let owner
		if (card instanceof ServerCardBuff || card instanceof ServerRowBuff) {
			owner = card.parent.owner
		} else {
			owner = card.owner
		}

		if (!owner) {
			return false
		}
		if (owner instanceof ServerPlayerGroup) {
			return owner === this
		}
		return this.players.includes(owner)
	}

	public includes(player: ServerPlayerInGame): boolean {
		return this.players.some((groupPlayer) => groupPlayer.player.id === player.player.id)
	}

	public addRoundWin(): void {
		this.setRoundWins(this.roundWins + 1)
	}

	public setRoundWins(roundWins: number): void {
		this.roundWins = roundWins
		OutgoingMessageHandlers.notifyAboutRoundWins(this)
	}

	public startRound(): void {
		if (!this.roundEnded) {
			return
		}
		this.roundEnded = false
		OutgoingMessageHandlers.notifyAboutRoundStarted(this)
		this.onRoundStart()
	}

	public onRoundStart(): void {
		if (this.game.roundIndex === 0) {
			this.game.events.postEvent(
				GameEventCreators.gameStarted({
					game: this.game,
					group: this,
				})
			)
		}
		this.game.events.postEvent(
			GameEventCreators.roundStarted({
				game: this.game,
				group: this,
			})
		)
		this.game.events.postEvent(
			GameEventCreators.postRoundStarted({
				game: this.game,
				group: this,
			})
		)
	}

	public startMulligan(): void {
		this.players.forEach((player) => player.startMulligan())
	}

	public get mulliganMode(): boolean {
		return this.players.some((player) => player.isMulliganMode)
	}

	public startTurn(): void {
		if (!this.turnEnded) {
			return
		}
		this.turnEnded = false
		this.players.forEach((player) => {
			player.startTurn()
			player.setUnitMana(1)
			player.refillSpellHand()
		})
		OutgoingMessageHandlers.notifyAboutTurnStarted(this)
		this.onTurnStart()
		OutgoingMessageHandlers.notifyAboutValidActionsChanged(this.game, this.players)
	}

	public onTurnStart(): void {
		this.game.events.postEvent(
			GameEventCreators.turnStarted({
				game: this.game,
				group: this,
			})
		)
	}

	public endTurn(): void {
		if (this.turnEnded) {
			return
		}
		this.turnEnded = true
		OutgoingMessageHandlers.notifyAboutTurnEnded(this)
		this.onTurnEnd()
	}

	public onTurnEnd(): void {
		this.players.forEach((player) => {
			player.cardHand.unitCards
				.filter((card) => card.features.includes(CardFeature.TEMPORARY_CARD))
				.forEach((card) => {
					player.cardHand.discardCard(card)
					player.cardGraveyard.addUnit(card)
				})
			player.cardHand.spellCards
				.filter((card) => card.features.includes(CardFeature.TEMPORARY_CARD))
				.forEach((card) => {
					player.cardHand.discardCard(card)
					player.cardGraveyard.addSpell(card)
				})
		})

		this.game.events.postEvent(
			GameEventCreators.turnEnded({
				game: this.game,
				group: this,
			})
		)
	}

	public endRound(): void {
		if (this.roundEnded) {
			return
		}
		this.endTurn()
		this.roundEnded = true
		OutgoingMessageHandlers.notifyAboutRoundEnded(this)
		this.onEndRound()
	}

	public onEndRound(): void {
		this.game.events.postEvent(
			GameEventCreators.roundEnded({
				game: this.game,
				group: this,
			})
		)
	}
}
