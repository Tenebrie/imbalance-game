import StoryCharacter, { storyCharacterFromString } from '@shared/enums/StoryCharacter'
import { parseTenScript, StatementType, TenScriptStatement, TenScriptStatementSelector } from '@src/game/models/ServerTenScriptParser'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import { createRandomGuid } from '@src/utils/Utils'
import { v4 as uuid } from 'uuid'

import OutgoingNovelMessages from '../handlers/outgoing/OutgoingNovelMessages'
import ServerGame from './ServerGame'

export default class ServerGameNovel {
	private readonly game: ServerGame

	private queuedStatements: {
		namespace: string
		statements: TenScriptStatement[]
	}[] = []

	private inlineChapters: Record<string, TenScriptStatement[]> = {}
	private scriptChapters: Record<string, () => string> = {}
	private creatorChapters: Record<string, (novel: ServerGameNovelCreator) => ServerGameNovelCreator> = {}

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

	public startDialog(script: string | (() => string)): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutDialogStarted(this.player)
		const creator = new ServerGameNovelCreator(this.game)
		creator.exec(script)

		return creator
	}

	public registerInlineChapter(name: string, statements: TenScriptStatement[]): void {
		this.inlineChapters[name.toLowerCase()] = statements
	}

	public registerScriptChapter(name: string, script: () => string): void {
		this.scriptChapters[name.toLowerCase()] = script
	}

	public registerCreatorChapter(name: string, creator: (novel: ServerGameNovelCreator) => ServerGameNovelCreator): void {
		this.creatorChapters[name.toLowerCase()] = creator
	}

	public executeChapter(id: string): void {
		id = id.toLowerCase()
		const targetChapter = this.inlineChapters[id] || this.scriptChapters[id] || this.creatorChapters[id]
		if (!targetChapter) {
			throw new Error(`Unable to find chapter '${id}'`)
		}

		OutgoingNovelMessages.notifyAboutDialogCuesCleared(this.player)

		this.executeInlineChapter(id)
		this.executeScriptChapter(id)
		this.executeCreatorChapter(id)
	}

	private executeInlineChapter(id: string): void {
		const chapterStatements = this.inlineChapters[id]
		if (!chapterStatements) {
			return
		}
		const namespace = id.split('/')[0]
		const runner = new ServerGameNovelRunner(this.game, namespace)
		runner.executeStatements(chapterStatements)
	}

	private executeScriptChapter(id: string): void {
		const chapterScript = this.scriptChapters[id]
		if (!chapterScript) {
			return
		}
		const scriptSyntaxTree = parseTenScript(chapterScript())
		const namespace = id.split('/')[0]
		const runner = new ServerGameNovelRunner(this.game, namespace)
		runner.executeStatements(scriptSyntaxTree.statements)
	}

	private executeCreatorChapter(id: string): void {
		const chapterCreator = this.creatorChapters[id]
		if (!chapterCreator) {
			return
		}
		chapterCreator(new ServerGameNovelCreatorRunner(this.game))
	}

	public hasQueue(): boolean {
		return this.queuedStatements.length > 0
	}

	public addToQueue(namespace: string, statements: TenScriptStatement[]): void {
		this.queuedStatements.unshift({
			namespace,
			statements,
		})
	}

	public continueQueue(): void {
		const queueEntry = this.queuedStatements.shift()
		if (!queueEntry) {
			OutgoingNovelMessages.notifyAboutDialogEnded(this.player)
			return
		}

		OutgoingNovelMessages.notifyAboutDialogCuesCleared(this.player)

		const runner = new ServerGameNovelRunner(this.game, queueEntry.namespace)
		runner.executeStatements(queueEntry.statements)
		return
	}
}

export class ServerGameNovelCreator {
	private readonly game: ServerGame
	private readonly namespace: string
	protected readonly runUnconditionally: boolean = false

	constructor(game: ServerGame) {
		this.game = game
		this.namespace = createRandomGuid()
	}

	public exec(script: string | (() => string)): ServerGameNovelCreator {
		const scriptSyntaxTree = parseTenScript(script)
		if (scriptSyntaxTree.errors.length > 0) {
			throw new Error(`TenScript parse error: ${scriptSyntaxTree.errors[0].message}`)
		}

		if (this.game.novel.hasQueue() && !this.runUnconditionally) {
			this.game.novel.addToQueue(this.namespace, scriptSyntaxTree.statements)
		} else {
			const runner = new ServerGameNovelRunner(this.game, this.namespace)
			runner.executeStatements(scriptSyntaxTree.statements)
		}

		return this
	}

	public chapter(chapterId: string | number, callback: () => string): ServerGameNovelCreator {
		this.game.novel.registerScriptChapter(`${this.namespace}/${chapterId}`, callback)
		return this
	}

	public continue(chapterId: string | number, callback: (novel: ServerGameNovelCreator) => ServerGameNovelCreator): ServerGameNovelCreator {
		this.game.novel.registerCreatorChapter(`${this.namespace}/${chapterId}`, callback)
		return this
	}

	public closingChapter(chapterId: string | number, callback: () => void): ServerGameNovelCreator {
		return this.chapter(chapterId, () => {
			callback()
			return ``
		})
	}
}

class ServerGameNovelCreatorRunner extends ServerGameNovelCreator {
	protected readonly runUnconditionally = true
}

export class ServerGameNovelRunner {
	private game: ServerGame
	private readonly namespace: string

	constructor(game: ServerGame, namespace: string) {
		this.game = game
		this.namespace = namespace
	}

	private get player(): ServerPlayerGroup {
		const player = this.game.getHumanGroup()
		if (!player) {
			throw new Error(`No human player in game ${this.game.id}!`)
		}
		return player
	}

	private handleStatementPreprocess(statement: TenScriptStatement): void {
		switch (statement.type) {
			case StatementType.CREATE_CHAPTER:
				const chapterId = `${this.namespace}/${statement.data}`
				this.game.novel.registerInlineChapter(chapterId, statement.children)
				break
		}
	}

	private handleStatementEffect(statement: TenScriptStatement): void {
		switch (statement.type) {
			case StatementType.SAY:
				const getMessage = (statement: TenScriptStatementSelector<StatementType.SAY>): string => {
					const filteredChildren = statement.children.filter(
						(child) => child.type === StatementType.SAY
					) as TenScriptStatementSelector<StatementType.SAY>[]
					const childrenMessages = filteredChildren.map((child) => getMessage(child)).join('<br>')
					if (childrenMessages) {
						return `${statement.data}<br>${childrenMessages}`
					}
					return statement.data
				}

				const message = getMessage(statement)
				OutgoingNovelMessages.notifyAboutDialogCue(this.player, {
					id: `cue:${uuid()}`,
					text: message,
				})
				break
			case StatementType.MOVE:
				const moveChapterId = `${this.namespace}/${statement.data}`
				OutgoingNovelMessages.notifyAboutDialogMove(this.player, {
					chapterId: moveChapterId,
				})
				break
			case StatementType.RESPONSE_INLINE:
				const inlineChapterId = `${this.namespace}/${createRandomGuid()}`
				this.game.novel.registerInlineChapter(inlineChapterId, statement.children)
				OutgoingNovelMessages.notifyAboutDialogResponse(this.player, {
					text: statement.data,
					chapterId: inlineChapterId,
				})
				break
			case StatementType.RESPONSE_CHAPTER:
				const responseChapterId = `${this.namespace}/${statement.data.chapterName}`
				OutgoingNovelMessages.notifyAboutDialogResponse(this.player, {
					text: statement.data.text,
					chapterId: responseChapterId,
				})
				break
			case StatementType.SET_SPEAKER:
				const character = storyCharacterFromString(statement.data) || StoryCharacter.UNKNOWN
				OutgoingNovelMessages.notifyAboutActiveDialogCharacter(this.player, character)
				break
		}
	}

	public executeStatements(statements: TenScriptStatement[]): void {
		statements.forEach((statement) => {
			this.handleStatementPreprocess(statement)
		})

		statements = statements.filter((statement) => statement.type !== StatementType.CREATE_CHAPTER)

		let state: 'normal' | 'post-move' | 'responses' = 'normal'
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i]
			if (state === 'normal' && (statement.type === StatementType.RESPONSE_INLINE || statement.type === StatementType.RESPONSE_CHAPTER)) {
				state = 'responses'
				this.handleStatementEffect(statement)
			} else if (
				state === 'responses' &&
				statement.type !== StatementType.RESPONSE_INLINE &&
				statement.type !== StatementType.RESPONSE_CHAPTER
			) {
				this.game.novel.addToQueue(this.namespace, statements.slice(i))
				break
			} else if (state === 'normal' && statement.type === StatementType.MOVE) {
				state = 'post-move'
				this.handleStatementEffect(statement)
			} else if (state === 'post-move') {
				this.game.novel.addToQueue(this.namespace, statements.slice(i))
				break
			} else {
				this.handleStatementEffect(statement)
			}
		}
		if (state === 'normal') {
			OutgoingNovelMessages.notifyAboutDialogSegmentEnded(this.player)
		}
	}
}
