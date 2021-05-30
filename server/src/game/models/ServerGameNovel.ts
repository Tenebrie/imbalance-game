import StoryCharacter from '@src/../../shared/src/enums/StoryCharacter'
import OutgoingNovelMessages from '../handlers/outgoing/OutgoingNovelMessages'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerGame from './ServerGame'
import { v4 as uuid } from 'uuid'
import NovelReply from '@shared/models/novel/NovelReply'

class ServerNovelReply implements NovelReply {
	public readonly id: string
	public readonly text: string
	public readonly callback: () => void

	constructor(text: string, callback: () => void) {
		this.id = `reply:${uuid()}`
		this.text = text
		this.callback = callback
	}
}

export default class ServerGameNovel {
	private game: ServerGame
	private creator: ServerGameNovelCreator

	private validReplies: ServerNovelReply[] = []

	constructor(game: ServerGame) {
		this.game = game
		this.creator = new ServerGameNovelCreator(game)
	}

	private get player(): ServerPlayerInGame {
		const player = this.game.getHumanPlayer()
		if (!player) {
			throw new Error(`No human player in game ${this.game.id}!`)
		}
		return player
	}

	public getState<T>(): T {
		return this.game.ruleset.state
	}

	public startDialog(): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutDialogStarted(this.player)
		this.creator.setCharacter(null)
		return this.creator
	}

	public registerReply(reply: ServerNovelReply): void {
		this.validReplies.push(reply)
	}

	public executeReply(id: string): void {
		const targetReply = this.validReplies.find((reply) => reply.id === id)
		if (!targetReply) {
			return
		}

		OutgoingNovelMessages.notifyAboutDialogCuesCleared(this.player)
		this.validReplies = []
		targetReply.callback()
	}
}

export class ServerGameNovelCreator {
	private game: ServerGame
	private activeCharacter: StoryCharacter | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	private get player(): ServerPlayerInGame {
		const player = this.game.getHumanPlayer()
		if (!player) {
			throw new Error(`No human player in game ${this.game.id}!`)
		}
		return player
	}

	public say(text: string): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutDialogCue(this.player, {
			id: `cue:${uuid()}`,
			text: text,
		})
		return this
	}

	public reply(text: string, callback: () => void): ServerGameNovelCreator {
		const reply = new ServerNovelReply(text, callback)
		this.game.novel.registerReply(reply)
		OutgoingNovelMessages.notifyAboutDialogReply(this.player, reply)
		return this
	}

	public setCharacter(character: StoryCharacter | null): ServerGameNovelCreator {
		this.activeCharacter = character
		OutgoingNovelMessages.notifyAboutActiveDialogCharacter(this.player, character)
		return this
	}

	public addCharacter(character: StoryCharacter): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutAddedDialogCharacter(this.player, character)
		return this
	}

	public removeCharacter(character: StoryCharacter): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutRemovedDialogCharacter(this.player, character)
		return this
	}

	public finish(): ServerGameNovel {
		OutgoingNovelMessages.notifyAboutDialogFinished(this.player)
		return this.game.novel
	}
}
