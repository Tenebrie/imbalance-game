import StoryCharacter from '@shared/enums/StoryCharacter'
import { enumToArray, forEachInEnum } from '@shared/Utils'
import { colorizeClass, colorizeConsoleText, colorizeId, snakeToCamelCase } from '@src/utils/Utils'
import { v4 as uuid } from 'uuid'

import { ServerGameNovelCreator } from './ServerGameNovel'

type TagHandle = {
	name: string
	statements: ParserStatement[]
}

export default class ServerGameNovelScriptParser {
	private activeCharacterStatements: string[] = []
	private processedTags: TagHandle[] = []

	private tagStack: TagHandle[] = []

	constructor(script: string) {
		const lines = script.split('\n')
		let statements: ParserStatement[] = []

		forEachInEnum(StoryCharacter, (char) => {
			const str = snakeToCamelCase(char)
			this.activeCharacterStatements.push(str.substr(0, 1).toUpperCase() + str.substr(1) + ':')
		})

		lines.forEach((line, index) => {
			const trimmedLine = line.trim()
			try {
				statements.push(this.parseLine(trimmedLine))
			} catch (err) {
				console.error(
					`Error parsing script at line ${colorizeId(index.toString())}:\n- Error: ${colorizeClass(
						(err as Error).message
					)}\n- Input: "${colorizeConsoleText(trimmedLine)}"`
				)
			}
		})
		statements = statements.filter((statement) => statement.type !== StatementType.NOP)

		this.startProcessingTag('rootSystemTag')
		statements.forEach((statement) => statement.process(this, this.tagStack[this.tagStack.length - 1]))
		this.closeProcessedTag()
	}

	public get tags(): Record<string, (dialog: ServerGameNovelCreator) => void> {
		const tags: Record<string, (dialog: ServerGameNovelCreator) => void> = {}
		this.processedTags
			.filter((tag) => tag.name !== 'rootSystemTag')
			.forEach(
				(tag) =>
					(tags[tag.name] = (dialog: ServerGameNovelCreator) => {
						tag.statements.forEach((statement) => statement.exec(dialog))
					})
			)
		return tags
	}

	public startProcessingTag(name: string): void {
		this.tagStack.push({
			name,
			statements: [],
		})
	}

	public closeProcessedTag(): void {
		this.processedTags.push(this.tagStack.pop()!)
	}

	private getStatementType(line: string): StatementType {
		if (this.activeCharacterStatements.includes(line)) {
			return StatementType.SET_CHARACTER
		} else if (line.startsWith('>>>')) {
			return StatementType.REPLY
		} else if (line.startsWith('>')) {
			return StatementType.SAY
		} else if (line.startsWith('==')) {
			return StatementType.CREATE_TAG
		} else if (line.startsWith('/==') || line.startsWith('<-')) {
			return StatementType.END_TAG
		} else if (line.startsWith('->') || line.startsWith('-->')) {
			return StatementType.CREATE_ANONYMOUS_TAG
		} else if (line.length === 0 || line.startsWith('//')) {
			return StatementType.NOP
		}
		throw new Error('Unrecognized statement type')
	}

	private parseLine(line: string): ParserStatement {
		const statementType = this.getStatementType(line)
		switch (statementType) {
			case StatementType.SAY:
				return new SayStatement(line)
			case StatementType.REPLY:
				return new ReplyStatement(line)
			case StatementType.SET_CHARACTER:
				return new SetCharacterStatement(line)
			case StatementType.CREATE_TAG:
				return new CreateTagStatement(line)
			case StatementType.END_TAG:
				return new EndTagStatement()
			case StatementType.CREATE_ANONYMOUS_TAG:
				return new CreateAnonymousTagStatement()
			case StatementType.NOP:
				return new NopStatement()
			default:
				throw new Error(`Statement type ${statementType} recognized, but not handled`)
		}
	}

	public exec(creator: ServerGameNovelCreator): void {
		const rootTag = this.processedTags.find((tag) => tag.name === 'rootSystemTag')
		if (!rootTag) {
			throw new Error('Unclosed tag in story definition.')
		}
		rootTag.statements.forEach((statement) => statement.exec(creator))
	}
}

enum StatementType {
	SAY = 'SAY',
	REPLY = 'REPLY',
	SET_CHARACTER = 'SET_CHARACTER',
	CREATE_TAG = 'CREATE_TAG',
	END_TAG = 'END_TAG',
	CREATE_ANONYMOUS_TAG = 'CREATE_ANONYMOUS_TAG',
	NOP = 'NOP',
}

interface ParserStatement {
	type: StatementType
	exec(dialog: ServerGameNovelCreator): void
	process(parser: ServerGameNovelScriptParser, currentTag: TagHandle): void
}

class SayStatement implements ParserStatement {
	private readonly text: string

	constructor(line: string) {
		this.text = line.substr(1).trim()
	}

	public get type(): StatementType {
		return StatementType.SAY
	}

	public exec(dialog: ServerGameNovelCreator): void {
		dialog.say(this.text)
	}

	public process(parser: ServerGameNovelScriptParser, currentTag: TagHandle): void {
		currentTag.statements.push(this)
	}
}

class ReplyStatement implements ParserStatement {
	private readonly text: string
	private conditionExpression: string | null
	private readonly actionExpression: string | null
	private anonymousActionName: string | null = null

	constructor(line: string) {
		const args = line.substr(3).trim().split('->')
		if (args[0].startsWith('[if')) {
			this.conditionExpression = args[0].substring(1, args[0].indexOf(']')).trim()
			this.text = args[0].substring(args[0].indexOf(']') + 1).trim()
		} else {
			this.text = args[0].trim()
			this.conditionExpression = null
		}
		if (args[1]) {
			this.actionExpression = args[1].trim()
		} else {
			this.actionExpression = null
		}
	}

	public get type(): StatementType {
		return StatementType.REPLY
	}

	public appendAnonymousAction(name: string): void {
		this.anonymousActionName = name
	}

	public exec(dialog: ServerGameNovelCreator): void {
		dialog.reply(
			this.text,
			this.anonymousActionName
				? this.anonymousActionName
				: this.actionExpression
				? this.actionExpression
				: () => {
						/* Empty */
				  }
		)
	}

	public process(parser: ServerGameNovelScriptParser, currentTag: TagHandle): void {
		currentTag.statements.push(this)
	}
}

class SetCharacterStatement implements ParserStatement {
	private readonly character: StoryCharacter

	constructor(line: string) {
		this.character = this.parseCharacter(line)
	}

	private parseCharacter(line: string): StoryCharacter {
		const charName = snakeToCamelCase(line.substr(0, line.length - 1).replace(' ', ''))
		const foundCharacter: StoryCharacter | null = enumToArray(StoryCharacter).find((char) => char === charName) || null
		if (foundCharacter === null) {
			throw new Error(`Unable to obtain character type for ${StatementType.SET_CHARACTER} statement`)
		}
		return foundCharacter
	}

	public get type(): StatementType {
		return StatementType.SET_CHARACTER
	}

	public exec(dialog: ServerGameNovelCreator): void {
		dialog.setCharacter(this.character)
	}

	public process(parser: ServerGameNovelScriptParser, currentTag: TagHandle): void {
		currentTag.statements.push(this)
	}
}

class CreateTagStatement implements ParserStatement {
	private readonly name: string

	constructor(line: string) {
		this.name = line.replace(/[()\[\]{}=]/g, '').trim()
	}

	public get type(): StatementType {
		return StatementType.CREATE_TAG
	}

	public exec(): void {
		/* Empty */
	}

	public process(parser: ServerGameNovelScriptParser): void {
		parser.startProcessingTag(this.name)
	}
}

class CreateAnonymousTagStatement implements ParserStatement {
	private readonly name: string

	constructor() {
		this.name = uuid()
	}

	public get type(): StatementType {
		return StatementType.CREATE_ANONYMOUS_TAG
	}

	public exec(): void {
		/* Empty */
	}

	public process(parser: ServerGameNovelScriptParser, currentTag: TagHandle): void {
		const lastStatement = currentTag.statements[currentTag.statements.length - 1]
		if (lastStatement instanceof ReplyStatement) {
			lastStatement.appendAnonymousAction(this.name)
		}
		parser.startProcessingTag(this.name)
	}
}

class EndTagStatement implements ParserStatement {
	public get type(): StatementType {
		return StatementType.END_TAG
	}

	public exec(): void {
		/* Empty */
	}

	public process(parser: ServerGameNovelScriptParser): void {
		parser.closeProcessedTag()
	}
}

class NopStatement implements ParserStatement {
	public get type(): StatementType {
		return StatementType.NOP
	}

	public exec(): void {
		/* Empty */
	}

	public process(): void {
		/* NOP */
	}
}
