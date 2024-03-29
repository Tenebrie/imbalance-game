import StoryCharacter, { storyCharacterFromString } from '@shared/enums/StoryCharacter'
import NovelCue from '@shared/models/novel/NovelCue'
import { Time } from '@shared/Utils'
import OutgoingAnimationMessages from '@src/game/handlers/outgoing/OutgoingAnimationMessages'
import ServerAnimation from '@src/game/models/ServerAnimation'
import {
	parseTenScript,
	StatementType,
	TenScriptParseError,
	TenScriptStatement,
	TenScriptStatementSelector,
} from '@src/game/models/ServerTenScriptParser'
import ServerPlayerGroup from '@src/game/players/ServerPlayerGroup'
import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerPlayerSpectator from '@src/game/players/ServerPlayerSpectator'
import { createRandomGuid } from '@src/utils/Utils'
import { v4 as uuid } from 'uuid'

import OutgoingNovelMessages from '../handlers/outgoing/OutgoingNovelMessages'
import ServerGame from './ServerGame'

export default class ServerGameNovel {
	private readonly game: ServerGame

	public clientState: {
		statements: TenScriptStatement[]
		lastCue: NovelCue | null
		namespace: string
	} | null = null
	public clientMoves: {
		chapterId: string
	}[] = []
	public clientResponses: {
		text: string
		chapterId: string
	}[] = []

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

	public isActive(): boolean {
		return !!this.clientState
	}

	public get player(): ServerPlayerGroup {
		const player = this.game.getHumanGroup()
		if (!player) {
			throw new Error(`No human player in game ${this.game.id}!`)
		}
		return player
	}

	public startDialog(script: string | (() => string)): ServerGameNovelCreator {
		OutgoingNovelMessages.notifyAboutDialogStarted(this.player)
		const creator = new ServerGameImmediateNovelCreator(this.game)
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

		this.clearClientState()
		OutgoingNovelMessages.notifyAboutDialogMuted(this.player)

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
		runner.executeStatements(chapterStatements, this.player)
	}

	private executeScriptChapter(id: string): void {
		const chapterScript = this.scriptChapters[id]
		if (!chapterScript) {
			return
		}
		const script = chapterScript()
		const scriptSyntaxTree = parseTenScript(script)
		throwIfParseFailed(script, scriptSyntaxTree)
		const namespace = id.split('/')[0]
		const runner = new ServerGameNovelRunner(this.game, namespace)
		runner.executeStatements(scriptSyntaxTree.statements, this.player)
	}

	private executeCreatorChapter(id: string): void {
		const chapterCreator = this.creatorChapters[id]
		if (!chapterCreator) {
			return
		}
		const creator = new ServerGameImmediateNovelUnconditionalCreator(this.game)
		chapterCreator(creator)
		creator.finalize()
	}

	public hasQueue(): boolean {
		return this.queuedStatements.length > 0
	}

	public hasSayStatementsToPop(): boolean {
		return !!this.clientState && this.clientState.statements.filter((statement) => statement.type === StatementType.SAY).length > 0
	}

	public addToQueue(
		namespace: string,
		statements: TenScriptStatement[],
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup
	): void {
		if (!(playerOrGroup instanceof ServerPlayerGroup)) {
			return
		}

		this.queuedStatements.unshift({
			namespace,
			statements,
		})
	}

	public continueQueue(): void {
		if (this.hasSayStatementsToPop() || this.clientResponses.length > 0) {
			return
		}

		const queueEntry = this.queuedStatements.shift()
		this.clearClientState()
		if (!queueEntry) {
			OutgoingNovelMessages.notifyAboutDialogEnded(this.player)
			return
		}

		const runner = new ServerGameNovelRunner(this.game, queueEntry.namespace)
		runner.executeStatements(queueEntry.statements, this.player)
		return
	}

	public appendClientState(statement: TenScriptStatement, namespace: string): void {
		if (!this.clientState) {
			this.clientState = {
				namespace,
				lastCue: null,
				statements: [],
			}
		}

		this.clientState.statements.push(statement)
	}

	public appendClientMoves(chapterId: string): void {
		this.clientMoves.push({
			chapterId,
		})
	}

	public appendClientResponses(text: string, chapterId: string): void {
		this.clientResponses.push({
			text,
			chapterId,
		})
	}

	public popClientStateCue(): boolean {
		if (!this.clientState) {
			return false
		}

		const poppedStatement = this.clientState.statements.find((statement) => statement.type === StatementType.SAY)

		if (poppedStatement && poppedStatement.type === StatementType.SAY) {
			this.clientState.statements.splice(this.clientState.statements.indexOf(poppedStatement), 1)
			this.clientState.lastCue = {
				id: uuid(),
				text: getSayStatementMessage(poppedStatement),
			}
			return true
		}
		return false
	}

	public restoreClientStateOnReconnect(player: ServerPlayerInGame | ServerPlayerSpectator): void {
		if (!this.clientState) {
			return
		}

		OutgoingNovelMessages.notifyAboutDialogStarted(player)
		if (this.clientState.lastCue) {
			OutgoingNovelMessages.notifyAboutLeftoverCue(player, this.clientState.lastCue)
		}

		const runner = new ServerGameNovelRunner(this.game, this.clientState.namespace)
		runner.executeStatements(this.clientState.statements, player)
	}

	public clearClientState(): void {
		this.clientState = null
		this.clientMoves = []
		this.clientResponses = []
		OutgoingNovelMessages.notifyAboutDialogCuesCleared(this.player)
	}
}

export interface ServerGameNovelCreator {
	exec(script: string | (() => string)): ServerGameNovelCreator
	chapter(chapterId: string | number, callback: () => string): ServerGameNovelCreator
	continue(chapterId: string | number, callback: (novel: ServerGameNovelCreator) => ServerGameNovelCreator): ServerGameNovelCreator
	actionChapter(chapterId: string | number, callback: () => void): ServerGameNovelCreator
}

export class ServerGameImmediateNovelCreator implements ServerGameNovelCreator {
	private readonly game: ServerGame
	private readonly namespace: string
	protected readonly runUnconditionally: boolean = false
	private isFinalized = false

	constructor(game: ServerGame) {
		this.game = game
		this.namespace = createRandomGuid()
	}

	public exec(scriptOrGetter: string | (() => string)): ServerGameImmediateNovelCreator {
		const script = typeof scriptOrGetter === 'function' ? scriptOrGetter() : scriptOrGetter
		const scriptSyntaxTree = parseTenScript(script)
		throwIfParseFailed(script, scriptSyntaxTree)

		if (this.game.novel.hasQueue() && !this.runUnconditionally) {
			this.game.novel.addToQueue(this.namespace, scriptSyntaxTree.statements, this.game.novel.player)
		} else {
			const runner = new ServerGameNovelRunner(this.game, this.namespace)
			runner.executeStatements(scriptSyntaxTree.statements, this.game.novel.player)
		}

		this.isFinalized = true
		return this
	}

	public chapter(chapterId: string | number, callback: () => string): ServerGameImmediateNovelCreator {
		this.game.novel.registerScriptChapter(`${this.namespace}/${chapterId}`, callback)
		return this
	}

	public continue(
		chapterId: string | number,
		callback: (novel: ServerGameNovelCreator) => ServerGameNovelCreator
	): ServerGameImmediateNovelCreator {
		this.game.novel.registerCreatorChapter(`${this.namespace}/${chapterId}`, callback)
		return this
	}

	public actionChapter(chapterId: string | number, callback: () => void): ServerGameImmediateNovelCreator {
		return this.chapter(chapterId, () => {
			callback()
			return ``
		})
	}

	public finalize(): void {
		if (!this.isFinalized) {
			const runner = new ServerGameNovelRunner(this.game, this.namespace)
			runner.executeStatements([], this.game.novel.player)
		}
	}
}

export class ServerGameDelayedNovelCreator implements ServerGameNovelCreator {
	private readonly startingScript: string | (() => string)
	private readonly statements: (
		| {
				type: 'exec'
				script: string | (() => string)
		  }
		| {
				type: 'chapter'
				id: string | number
				callback: () => string
		  }
		| {
				type: 'continue'
				id: string | number
				callback: (novel: ServerGameNovelCreator) => ServerGameNovelCreator
		  }
	)[] = []

	public constructor(script: string | (() => string)) {
		this.startingScript = script
	}

	public exec(script: string | (() => string)): ServerGameDelayedNovelCreator {
		this.statements.push({
			type: 'exec',
			script,
		})
		return this
	}

	public chapter(chapterId: string | number, callback: () => string): ServerGameDelayedNovelCreator {
		this.statements.push({
			type: 'chapter',
			id: chapterId,
			callback,
		})
		return this
	}

	public continue(
		chapterId: string | number,
		callback: (novel: ServerGameNovelCreator) => ServerGameNovelCreator
	): ServerGameDelayedNovelCreator {
		this.statements.push({
			type: 'continue',
			id: chapterId,
			callback,
		})
		return this
	}

	public actionChapter(chapterId: string | number, callback: () => void): ServerGameDelayedNovelCreator {
		return this.chapter(chapterId, () => {
			callback()
			return ``
		})
	}

	public run(game: ServerGame): void {
		const creator = game.novel.startDialog(this.startingScript)
		this.statements.forEach((statement) => {
			if (statement.type === 'exec') {
				creator.exec(statement.script)
			} else if (statement.type === 'chapter') {
				creator.chapter(statement.id, statement.callback)
			} else if (statement.type === 'continue') {
				creator.continue(statement.id, statement.callback)
			}
		})
	}
}

class ServerGameImmediateNovelUnconditionalCreator extends ServerGameImmediateNovelCreator {
	protected readonly runUnconditionally = true
}

export class ServerGameNovelRunner {
	private game: ServerGame
	private readonly namespace: string

	constructor(game: ServerGame, namespace: string) {
		this.game = game
		this.namespace = namespace
	}

	private handleStatementPreprocess(statement: TenScriptStatement): void {
		switch (statement.type) {
			case StatementType.CREATE_CHAPTER:
				const chapterId = `${this.namespace}/${statement.data}`
				this.game.novel.registerInlineChapter(chapterId, statement.children)
				break
		}
	}

	private handleStatementEffect(
		statement: TenScriptStatement,
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup
	): void {
		const isWritingMode = playerOrGroup instanceof ServerPlayerGroup

		if (isWritingMode) {
			this.game.novel.appendClientState(statement, this.namespace)
		}

		switch (statement.type) {
			case StatementType.SAY:
				const message = getSayStatementMessage(statement)
				OutgoingNovelMessages.notifyAboutDialogCue(playerOrGroup, {
					id: `cue:${uuid()}`,
					text: message,
				})
				break
			case StatementType.MOVE:
				const moveChapterId = `${this.namespace}/${statement.data}`
				const moveAction = {
					chapterId: moveChapterId,
				}
				OutgoingNovelMessages.notifyAboutDialogMove(playerOrGroup, moveAction)
				if (isWritingMode) {
					this.game.novel.appendClientMoves(moveChapterId)
				}
				break
			case StatementType.RESPONSE_INLINE:
				const inlineChapterId = `${this.namespace}/${createRandomGuid()}`
				this.game.novel.registerInlineChapter(inlineChapterId, statement.children)
				const inlineResponse = {
					text: statement.data,
					chapterId: inlineChapterId,
				}
				OutgoingNovelMessages.notifyAboutDialogResponse(playerOrGroup, inlineResponse)
				if (isWritingMode) {
					this.game.novel.appendClientResponses(inlineResponse.text, inlineResponse.chapterId)
				}
				break
			case StatementType.RESPONSE_CHAPTER:
				const responseChapterId = `${this.namespace}/${statement.data.chapterName}`
				const chapterResponse = {
					text: statement.data.text,
					chapterId: responseChapterId,
				}
				OutgoingNovelMessages.notifyAboutDialogResponse(playerOrGroup, chapterResponse)
				if (isWritingMode) {
					this.game.novel.appendClientResponses(chapterResponse.text, chapterResponse.chapterId)
				}
				break
			case StatementType.SET_SPEAKER:
				const character = storyCharacterFromString(statement.data) || StoryCharacter.UNKNOWN
				OutgoingNovelMessages.notifyAboutActiveDialogCharacter(playerOrGroup, character)
				break
		}
	}

	public executeStatements(
		statements: TenScriptStatement[],
		playerOrGroup: ServerPlayerInGame | ServerPlayerSpectator | ServerPlayerGroup
	): void {
		statements.forEach((statement) => {
			this.handleStatementPreprocess(statement)
		})

		statements = statements.filter((statement) => statement.type !== StatementType.CREATE_CHAPTER)

		let state: 'normal' | 'post-move' | 'responses' = 'normal'
		for (let i = 0; i < statements.length; i++) {
			const statement = statements[i]
			if (state === 'normal' && (statement.type === StatementType.RESPONSE_INLINE || statement.type === StatementType.RESPONSE_CHAPTER)) {
				state = 'responses'
				this.handleStatementEffect(statement, playerOrGroup)
			} else if (
				state === 'responses' &&
				statement.type !== StatementType.RESPONSE_INLINE &&
				statement.type !== StatementType.RESPONSE_CHAPTER
			) {
				this.game.novel.addToQueue(this.namespace, statements.slice(i), playerOrGroup)
				break
			} else if (state === 'normal' && statement.type === StatementType.MOVE) {
				state = 'post-move'
				this.handleStatementEffect(statement, playerOrGroup)
			} else if (state === 'post-move') {
				this.game.novel.addToQueue(this.namespace, statements.slice(i), playerOrGroup)
				break
			} else {
				this.handleStatementEffect(statement, playerOrGroup)
			}
		}
		if (state === 'normal') {
			OutgoingNovelMessages.notifyAboutDialogSegmentEnded(playerOrGroup)
		} else if (state === 'responses') {
			const players = playerOrGroup instanceof ServerPlayerGroup ? playerOrGroup.players : [playerOrGroup]
			OutgoingAnimationMessages.triggerAnimationForPlayers(players, ServerAnimation.delay(Time.minutes.toMilliseconds(60)))
		}
	}
}

const getSayStatementMessage = (statement: TenScriptStatementSelector<StatementType.SAY>): string => {
	const filteredChildren = statement.children.filter(
		(child) => child.type === StatementType.SAY
	) as TenScriptStatementSelector<StatementType.SAY>[]
	const childrenMessages = filteredChildren.map((child) => getSayStatementMessage(child)).join(' ')
	if (childrenMessages) {
		return `${statement.data} ${childrenMessages}`
	}
	return statement.data
}

const throwIfParseFailed = (
	script: string,
	scriptSyntaxTree: { statements: TenScriptStatement[]; errors: TenScriptParseError[] }
): void => {
	if (scriptSyntaxTree.errors.length === 0) {
		return
	}
	const padNumber = (value: number): string => {
		return value.toString().padStart(3, ' ')
	}
	const error = scriptSyntaxTree.errors[0]
	const scriptLines = script.split('\n')
	const previousLine = error.line > 0 ? `${padNumber(error.line - 1)}: ${scriptLines[error.line - 1].replace(/\t/g, ' ')}\n       ` : ''
	const at = previousLine + padNumber(error.line) + ': ' + script.split('\n')[error.line].replace(/\t/g, ' ')
	const pointerLine =
		Array(error.column + 5)
			.fill(' ')
			.join('') + Array(error.length).fill('^').join('')
	throw new Error(`TenScript parse error: ${error.message}\n    at ${at}\n    ${pointerLine}`)
}
