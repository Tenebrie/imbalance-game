import StoryCharacter from '@shared/enums/StoryCharacter'
import NovelReply from '@shared/models/novel/NovelReply'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { v4 as uuid } from 'uuid'

import OutgoingNovelMessages from '../handlers/outgoing/OutgoingNovelMessages'
import ServerGame from './ServerGame'
import ServerGameNovelScriptParser from './ServerGameScriptParser'

class ServerNovelReply implements NovelReply {
	public readonly id: string
	public readonly text: string
	public readonly callbackOrTagName: ((dialog: ServerGameNovelCreator) => void) | string

	constructor(text: string, callbackOrTagName: ((dialog: ServerGameNovelCreator) => void) | string) {
		this.id = `reply:${uuid()}`
		this.text = text
		this.callbackOrTagName = callbackOrTagName
	}
}

export default class ServerGameNovel {
	private game: ServerGame
	private creator: ServerGameNovelCreator

	private validReplies: ServerNovelReply[] = []
	private tags: Record<string, (dialog: ServerGameNovelCreator) => void> = {}

	constructor(game: ServerGame) {
		this.game = game
		this.creator = new ServerGameNovelCreator(game)
	}

	private get player(): ServerPlayerGroup {
		const player = this.game.getHumanGroup()
		if (!player) {
			throw new Error(`No human player in game ${this.game.id}!`)
		}
		return player
	}

	public startDialog(): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutDialogStarted(this.player)
		this.creator.setCharacter(null)
		return this.creator
	}

	public registerReply(reply: ServerNovelReply): void {
		this.validReplies.push(reply)
	}

	public registerTag(name: string, callback: (dialog: ServerGameNovelCreator) => void): void {
		this.tags[name] = callback
	}

	public executeReply(id: string): void {
		const targetReply = this.validReplies.find((reply) => reply.id === id)
		if (!targetReply) {
			return
		}

		OutgoingNovelMessages.notifyAboutDialogCuesCleared(this.player)
		this.validReplies = []

		const callbackOrTagName = targetReply.callbackOrTagName
		if (typeof callbackOrTagName === 'string') {
			callbackOrTagName
				.split(',')
				.map((tag) => tag.trim())
				.forEach((tag) => {
					const callback = this.tags[tag]
					if (!callback) {
						throw new Error(`Story tag named ${tag} does not exist.`)
					}
					callback(this.creator)
				})
		} else {
			callbackOrTagName(this.creator)
		}
	}
}

export class ServerGameNovelCreator {
	private game: ServerGame
	private activeCharacter: StoryCharacter | null = null

	constructor(game: ServerGame) {
		this.game = game
	}

	private get player(): ServerPlayerGroup {
		const player = this.game.getHumanGroup()
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

	public reply(text: string, callbackOrTagName: ((dialog: ServerGameNovelCreator) => void) | string): ServerGameNovelCreator {
		const reply = new ServerNovelReply(text, callbackOrTagName)
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

	public parse(script: string): ServerGameNovelCreator {
		const parser = new ServerGameNovelScriptParser(script)
		const tags = parser.tags
		Object.keys(tags).forEach((key) => this.game.novel.registerTag(key, tags[key]))
		parser.exec(this)
		return this
	}

	public createTag(tag: string, callback: (dialog: ServerGameNovelCreator) => void | string): ServerGameNovelCreator {
		this.game.novel.registerTag(tag, callback)
		return this
	}

	public finish(): ServerGameNovel {
		OutgoingNovelMessages.notifyAboutDialogFinished(this.player)
		return this.game.novel
	}
}
