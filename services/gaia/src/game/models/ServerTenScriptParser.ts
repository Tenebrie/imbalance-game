import StoryCharacter, { storyCharacterFromString } from '@shared/enums/StoryCharacter'

type ParseError = {
	code: ParseErrorType
	message: string
	line: number
	column: number
	length: number
}
export type TenScriptParseError = ParseError

export const parseTenScript = (scriptOrGetter: string | (() => string)): { statements: Statement[]; errors: ParseError[] } => {
	const script = typeof scriptOrGetter === 'function' ? scriptOrGetter() : scriptOrGetter
	return toSyntaxTree(script)
}

export enum StatementType {
	PLACEHOLDER = 'PLACEHOLDER',

	SAY = 'SAY',
	MOVE = 'MOVE',

	RESPONSE_INLINE = 'RESPONSE_INLINE',
	RESPONSE_CHAPTER = 'RESPONSE_CHAPTER',

	SET_SPEAKER = 'SET_SPEAKER',

	CREATE_CHAPTER = 'CREATE_CHAPTER',
}

type StatementValueMapping = {
	[StatementType.SAY]: string
	[StatementType.MOVE]: string
	[StatementType.RESPONSE_INLINE]: string
	[StatementType.RESPONSE_CHAPTER]: {
		text: string
		chapterName: string
	}
	[StatementType.SET_SPEAKER]: StoryCharacter
	[StatementType.CREATE_CHAPTER]: string

	[StatementType.PLACEHOLDER]: null
}

enum ParserState {
	UNDEFINED = 'UNDEFINED',
	EOL = 'EOL',
	SAY_TEXT = 'SAY_TEXT',
	REPLY_TEXT = 'REPLY_TEXT',
	REPLY_TEXT_OR_CHAPTER_DASH = 'REPLY_TEXT_OR_CHAPTER_DASH',
	RESPONSE_CHAPTER_NAME = 'RESPONSE_CHAPTER_NAME',
	CHARACTER_OR_CHAPTER_NAME = 'CHARACTER_OR_CHAPTER_NAME',
	MOVE_STATEMENT_ARROW = 'MOVE_STATEMENT_ARROW',
	MOVE_STATEMENT_CHAPTER = 'MOVE_STATEMENT_CHAPTER',
}

const LEAF_NODES = [StatementType.MOVE, StatementType.SET_SPEAKER, StatementType.RESPONSE_CHAPTER]
const BRANCH_NODES = [StatementType.CREATE_CHAPTER]

type StatementTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
		debugInfo: {
			line: number
			column: number
			length: number
		}
		children: Statement[]
	}
}[keyof T]
type Statement = StatementTyper<StatementValueMapping>
export type TenScriptStatement = Statement

type StatementSelector<K extends keyof StatementValueMapping> = {
	type: K
	data: StatementValueMapping[K]
	debugInfo: {
		line: number
		column: number
		length: number
	}
	children: Statement[]
}
export type TenScriptStatementSelector<K extends keyof StatementValueMapping> = StatementSelector<K>

type PartialStatementTyper<T> = {
	[K in keyof T]: {
		type: K
		data: T[K]
	}
}[keyof T]
type PartialStatement = PartialStatementTyper<StatementValueMapping>

type Context = {
	state: ParserState
	firstBuffer: string
	secondBuffer: string
	indent: number
	lineNumber: number
	columnNumber: number
	caretColumnNumber: number
	indentationMode: 'tabs' | 'spaces' | null
	blockStack: Statement[]
	errors: ParseError[]
	pushStatement(statement: PartialStatement): void
	stepIn(): void
	stepOutToRoot(): void
}

type StateTransitionActionReturnValue =
	| {
			consume: boolean
	  }
	| {
			error: ParseError
	  }

type StateTransitionActionArgs = {
	context: Context
	char: string
}
type StateTransition = {
	from: ParserState[]
	when: string
	to: ParserState
	do(args: StateTransitionActionArgs): StateTransitionActionReturnValue
}

const VALID_TEXT_CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789[]() ?!,.\'"🎂:;'

const stateTransitions: StateTransition[] = [
	{
		from: [ParserState.UNDEFINED, ParserState.EOL],
		when: '\n',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			context.stepOutToRoot()
			context.firstBuffer = ''
			context.secondBuffer = ''
			return { consume: true }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: ' ',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			if (context.indentationMode === null) {
				context.indentationMode = 'spaces'
			} else if (context.indentationMode === 'tabs') {
				return { error: formatMixedIndentationError(context) }
			}
			context.stepIn()
			return { consume: true }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: '\t',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			if (context.indentationMode === null) {
				context.indentationMode = 'tabs'
			} else if (context.indentationMode === 'spaces') {
				return { error: formatMixedIndentationError(context) }
			}
			context.stepIn()
			return { consume: true }
		},
	},
	{
		from: [ParserState.EOL],
		when: ' \t',
		to: ParserState.EOL,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: '>',
		to: ParserState.SAY_TEXT,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.SAY_TEXT],
		when: VALID_TEXT_CHARACTERS.concat('-'),
		to: ParserState.SAY_TEXT,
		do: ({ context, char }): StateTransitionActionReturnValue => {
			context.firstBuffer += char
			return { consume: true }
		},
	},
	{
		from: [ParserState.SAY_TEXT],
		when: '\n',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			context.pushStatement({
				type: StatementType.SAY,
				data: context.firstBuffer.trim(),
			})
			return { consume: false }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: '@',
		to: ParserState.REPLY_TEXT,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.REPLY_TEXT],
		when: VALID_TEXT_CHARACTERS,
		to: ParserState.REPLY_TEXT,
		do: ({ context, char }): StateTransitionActionReturnValue => {
			context.firstBuffer += char
			return { consume: true }
		},
	},
	{
		from: [ParserState.REPLY_TEXT],
		when: '\n',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			context.pushStatement({
				type: StatementType.RESPONSE_INLINE,
				data: context.firstBuffer.trim(),
			})
			return { consume: false }
		},
	},
	{
		from: [ParserState.REPLY_TEXT],
		when: '-',
		to: ParserState.REPLY_TEXT_OR_CHAPTER_DASH,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.REPLY_TEXT_OR_CHAPTER_DASH],
		when: '>',
		to: ParserState.RESPONSE_CHAPTER_NAME,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.REPLY_TEXT_OR_CHAPTER_DASH],
		when: VALID_TEXT_CHARACTERS.concat('[]()\n'),
		to: ParserState.REPLY_TEXT,
		do: ({ context }): StateTransitionActionReturnValue => {
			context.firstBuffer += '-'
			context.secondBuffer = ''
			return { consume: false }
		},
	},
	{
		from: [ParserState.RESPONSE_CHAPTER_NAME],
		when: "abcdefghijklmnopqrstuvwxyz0123456789 ?!,.'-[]()",
		to: ParserState.RESPONSE_CHAPTER_NAME,
		do: ({ context, char }): StateTransitionActionReturnValue => {
			context.secondBuffer += char
			return { consume: true }
		},
	},
	{
		from: [ParserState.RESPONSE_CHAPTER_NAME],
		when: '\n',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			const name = context.secondBuffer.toLowerCase().trim()
			if (name.length === 0) {
				return { error: formatEmptyChapterNameInChapterStatementError(context) }
			}

			const storyCharacter = storyCharacterFromString(name)
			if (storyCharacter) {
				context.firstBuffer = ''
				context.secondBuffer = ''
				return { error: formatChapterNamedAsCharacterError(name, context) }
			}

			context.pushStatement({
				type: StatementType.RESPONSE_CHAPTER,
				data: {
					text: context.firstBuffer.trim(),
					chapterName: name,
				},
			})
			return { consume: false }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: 'abcdefghijklmnopqrstuvwxyz0123456789_',
		to: ParserState.CHARACTER_OR_CHAPTER_NAME,
		do: (): StateTransitionActionReturnValue => {
			return { consume: false }
		},
	},
	{
		from: [ParserState.CHARACTER_OR_CHAPTER_NAME],
		when: 'abcdefghijklmnopqrstuvwxyz0123456789-_',
		to: ParserState.CHARACTER_OR_CHAPTER_NAME,
		do: ({ context, char }): StateTransitionActionReturnValue => {
			context.firstBuffer += char
			return { consume: true }
		},
	},
	{
		from: [ParserState.CHARACTER_OR_CHAPTER_NAME],
		when: ':',
		to: ParserState.EOL,
		do: ({ context }): StateTransitionActionReturnValue => {
			const name = context.firstBuffer.toLowerCase().trim()
			const storyCharacter = storyCharacterFromString(name)
			if (storyCharacter) {
				context.pushStatement({
					type: StatementType.SET_SPEAKER,
					data: storyCharacter,
				})
			} else {
				context.pushStatement({
					type: StatementType.CREATE_CHAPTER,
					data: name,
				})
			}

			return { consume: true }
		},
	},
	{
		from: [ParserState.UNDEFINED],
		when: '-',
		to: ParserState.MOVE_STATEMENT_ARROW,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.MOVE_STATEMENT_ARROW],
		when: '-',
		to: ParserState.MOVE_STATEMENT_ARROW,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.MOVE_STATEMENT_ARROW],
		when: '>',
		to: ParserState.MOVE_STATEMENT_CHAPTER,
		do: (): StateTransitionActionReturnValue => {
			return { consume: true }
		},
	},
	{
		from: [ParserState.MOVE_STATEMENT_CHAPTER],
		when: "abcdefghijklmnopqrstuvwxyz0123456789 ?!,.'-[]()",
		to: ParserState.MOVE_STATEMENT_CHAPTER,
		do: ({ context, char }): StateTransitionActionReturnValue => {
			context.firstBuffer += char
			return { consume: true }
		},
	},
	{
		from: [ParserState.MOVE_STATEMENT_CHAPTER],
		when: '\n',
		to: ParserState.UNDEFINED,
		do: ({ context }): StateTransitionActionReturnValue => {
			const name = context.firstBuffer.toLowerCase().trim()
			if (name.length === 0) {
				return { error: formatEmptyChapterNameInMoveStatementError(context) }
			}

			const storyCharacter = storyCharacterFromString(name)
			if (storyCharacter) {
				context.firstBuffer = ''
				return { error: formatChapterNamedAsCharacterError(name, context) }
			}

			context.pushStatement({
				type: StatementType.MOVE,
				data: name,
			})
			return { consume: false }
		},
	},
]

const toSyntaxTree = (
	script: string
): {
	statements: Statement[]
	errors: ParseError[]
} => {
	const rootBlock: Statement = {
		type: StatementType.PLACEHOLDER,
		data: null,
		children: [],
		debugInfo: {
			line: 0,
			column: 0,
			length: 0,
		},
	}

	const currentContext: Context = {
		state: ParserState.UNDEFINED,
		indent: 0,
		firstBuffer: '',
		secondBuffer: '',
		lineNumber: 0,
		columnNumber: 0,
		caretColumnNumber: 0,
		indentationMode: null,
		blockStack: [rootBlock],
		errors: [],
		pushStatement(statement: Statement) {
			const currentBlock = currentContext.blockStack[currentContext.blockStack.length - 1]
			currentBlock.children.push({
				...statement,
				children: [],
				debugInfo: {
					line: currentContext.lineNumber,
					column: currentContext.columnNumber,
					length: currentContext.caretColumnNumber - currentContext.columnNumber,
				},
			})
		},
		stepIn() {
			const currentBlock = currentContext.blockStack[currentContext.blockStack.length - 1]
			const lastStatement = currentBlock.children[currentBlock.children.length - 1]
			if (lastStatement) {
				currentContext.blockStack.push(lastStatement)
				return
			}
			const newBlock: Statement = {
				type: StatementType.PLACEHOLDER,
				data: null,
				children: [],
				debugInfo: {
					line: currentContext.lineNumber,
					column: currentContext.columnNumber,
					length: currentContext.caretColumnNumber - currentContext.columnNumber,
				},
			}
			currentBlock.children.push(newBlock)
			currentContext.blockStack.push(newBlock)
		},
		stepOutToRoot() {
			currentContext.blockStack = [rootBlock]
			currentContext.lineNumber += 1
			currentContext.columnNumber = 0
			currentContext.caretColumnNumber = 0
		},
	}

	const chars = Array.from(script.trimEnd() + '\n')

	for (let i = 0; i < chars.length; i++) {
		const char = chars[i]
		const transitions = stateTransitions.filter((t) => t.from.includes(currentContext.state) && t.when.includes(char.toLowerCase()))
		if (transitions.length === 0) {
			currentContext.errors.push(formatUnableToFindTransitionError(currentContext, char))
			return { statements: [], errors: currentContext.errors }
		}

		if (transitions.length > 1) {
			currentContext.errors.push(formatAmbiguousTransitionError(currentContext, char, transitions))
			return { statements: [], errors: currentContext.errors }
		}

		const transition = transitions[0]
		const returnValue = transition.do({
			context: currentContext,
			char,
		})

		if ('error' in returnValue) {
			currentContext.errors.push(returnValue.error)
			break
		}

		if (!returnValue.consume && transition.from.includes(transition.to)) {
			currentContext.errors.push(formatDidNotConsumeError(transition, currentContext, char))
			return { statements: [], errors: currentContext.errors }
		}

		currentContext.state = transition.to
		currentContext.columnNumber = currentContext.caretColumnNumber - currentContext.firstBuffer.length

		if (returnValue.consume) {
			currentContext.caretColumnNumber += 1
		} else {
			i -= 1
		}
	}

	// Optimize empty blocks
	const optimizeBlock = (statement: Statement): Statement[] => {
		if (statement.type === StatementType.PLACEHOLDER) {
			return statement.children.flatMap((child) => optimizeBlock(child))
		}

		return [statement]
	}
	const rootStatements = optimizeBlock(rootBlock)

	// Validate children
	const validateChildren = (statement: Statement): void => {
		if (LEAF_NODES.includes(statement.type) && statement.children.length > 0) {
			currentContext.errors.push(formatLeafNodeChildrenError(statement))
		} else if (BRANCH_NODES.includes(statement.type) && statement.children.length === 0) {
			currentContext.errors.push(formatBranchNodeChildrenError(statement))
		}
		statement.children.forEach((child) => validateChildren(child))
	}
	rootStatements.forEach((child) => validateChildren(child))

	if (currentContext.errors.length > 0) {
		return {
			statements: [],
			errors: currentContext.errors,
		}
	}

	return {
		statements: rootStatements,
		errors: [],
	}
}

export enum ParseErrorType {
	NO_SCRIPT = 'NO_SCRIPT',
	NO_TRANSITION = 'NO_TRANSITION',
	AMBIGUOUS_TRANSITION = 'AMBIGUOUS_TRANSITION',
	DID_NOT_CONSUME = 'DID_NOT_CONSUME',
	LEAF_NODE_CHILDREN = 'LEAF_NODE_CHILDREN',
	BRANCH_NODE_CHILDREN = 'BRANCH_NODE_CHILDREN',
	MIXED_INDENTATION = 'MIXED_INDENTATION',
	CHAPTER_NAMED_AS_CHARACTER = 'CHAPTER_NAMED_AS_CHARACTER',
	EMPTY_CHAPTER_NAME = 'EMPTY_CHAPTER_NAME',
}

const formatLeafNodeChildrenError = (statement: Statement): ParseError => {
	return {
		code: ParseErrorType.LEAF_NODE_CHILDREN,
		message: `Node ${statement.type} is not allowed to have children. Children found: ${statement.children.length}.`,
		...statement.debugInfo,
	}
}

const formatBranchNodeChildrenError = (statement: Statement): ParseError => {
	return {
		code: ParseErrorType.BRANCH_NODE_CHILDREN,
		message: `Node ${statement.type} must have children.`,
		...statement.debugInfo,
	}
}

const formatUnableToFindTransitionError = (context: Context, char: string): ParseError => {
	const transitionsFromState = stateTransitions.filter((t) => t.from.includes(context.state))
	const transitionsWhenChar = stateTransitions.filter((t) => t.when.includes(char))
	let formattedTransitions = `\nValid transitions from ${context.state}:`
	if (transitionsFromState.length === 0) {
		formattedTransitions += '\n- None'
	}
	transitionsFromState.forEach((t) => {
		formattedTransitions += `\n- On '${t.when}' -> ${t.to}`
	})
	formattedTransitions += `\nValid transitions on '${char}' character:`
	if (transitionsWhenChar.length === 0) {
		formattedTransitions += '\n- None'
	}
	transitionsWhenChar.forEach((t) => {
		formattedTransitions += `\n- ${t.from} -> ${t.to}`
	})

	return {
		code: ParseErrorType.NO_TRANSITION,
		message: `Unable to find a valid transition from state ${context.state} on character '${char}'.${formattedTransitions}`,
		line: context.lineNumber,
		column: context.columnNumber,
		length: context.caretColumnNumber - context.columnNumber,
	}
}

const formatAmbiguousTransitionError = (context: Context, char: string, transitions: StateTransition[]): ParseError => {
	let formattedTransitions = `\nTransitions:`
	transitions.forEach((t) => {
		formattedTransitions += `\n- On '${t.when}' -> ${t.to}`
	})

	return {
		code: ParseErrorType.AMBIGUOUS_TRANSITION,
		message: `Found multiple transitions from state ${context.state} on character '${char}'.${formattedTransitions}`,
		line: context.lineNumber,
		column: context.columnNumber,
		length: context.caretColumnNumber - context.columnNumber,
	}
}

const formatDidNotConsumeError = (transition: StateTransition, context: Context, char: string): ParseError => {
	return {
		code: ParseErrorType.DID_NOT_CONSUME,
		message: `Transition ${transition.from} -> ${transition.to} on '${transition.when}' did not consume the '${char}' character and did not change the current state.`,
		line: context.lineNumber,
		column: context.columnNumber,
		length: context.caretColumnNumber - context.columnNumber,
	}
}

const formatMixedIndentationError = (context: Context): ParseError => {
	return {
		code: ParseErrorType.MIXED_INDENTATION,
		message: `Mixed tabs and spaces in indentation.`,
		line: context.lineNumber,
		column: context.columnNumber,
		length: context.caretColumnNumber - context.columnNumber,
	}
}

const formatChapterNamedAsCharacterError = (name: string, context: Context): ParseError => {
	return {
		code: ParseErrorType.CHAPTER_NAMED_AS_CHARACTER,
		message: `Chapter can't be named the same as a story character (${name}).`,
		line: context.lineNumber,
		column: context.columnNumber,
		length: context.caretColumnNumber - context.columnNumber,
	}
}

const formatEmptyChapterNameInMoveStatementError = (context: Context): ParseError => {
	return {
		code: ParseErrorType.EMPTY_CHAPTER_NAME,
		message: `Chapter name expected, but not provided.`,
		line: context.lineNumber,
		column: context.caretColumnNumber + 2,
		length: 1,
	}
}

const formatEmptyChapterNameInChapterStatementError = (context: Context): ParseError => {
	return {
		code: ParseErrorType.EMPTY_CHAPTER_NAME,
		message: `Chapter name expected, but not provided.`,
		line: context.lineNumber,
		column: context.caretColumnNumber + 2,
		length: 1,
	}
}
