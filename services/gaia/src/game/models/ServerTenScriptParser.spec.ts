import StoryCharacter from '@shared/enums/StoryCharacter'

import { ParseErrorType, parseTenScript, StatementType } from './ServerTenScriptParser'

describe('ServerTenScriptParser', () => {
	describe('basic case', () => {
		it('parses correctly', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
				> Me talk:
				> Me talk a lot;
				> A lot a lot.
				Protagonist:
				@ This is a first reply
					Narrator:
					> I reply to your first reply
				@ This is a second reply
					Narrator:
					> I reply to your second reply
				@ This is a reply with a follow-up
					> Which the player continues to say
					> Like, the same character you play.
				> ...and now we're back here after the reply has been replied.
				
				@ This is first of the second set of replies
				@ This is second of the second set of replies
				> Very meaningful choices they are, yes.
				Narrator:
				> And at the very end the Worker character can chat as well.
			`
			)

			expect(parsedScript.errors).toEqual([])
			expect(parsedScript.statements).toEqual([
				{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 1, column: 4, length: 9 } },
				{ type: StatementType.SAY, data: 'Me talk:', children: [], debugInfo: { line: 2, column: 5, length: 10 } },
				{ type: StatementType.SAY, data: 'Me talk a lot;', children: [], debugInfo: { line: 3, column: 5, length: 16 } },
				{ type: StatementType.SAY, data: 'A lot a lot.', children: [], debugInfo: { line: 4, column: 5, length: 14 } },
				{ type: StatementType.SET_SPEAKER, data: 'protagonist', children: [], debugInfo: { line: 5, column: 4, length: 12 } },
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is a first reply',
					children: [
						{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 7, column: 5, length: 9 } },
						{ type: StatementType.SAY, data: 'I reply to your first reply', children: [], debugInfo: { line: 8, column: 6, length: 29 } },
					],
					debugInfo: { line: 6, column: 5, length: 23 },
				},
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is a second reply',
					children: [
						{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 10, column: 5, length: 9 } },
						{ type: StatementType.SAY, data: 'I reply to your second reply', children: [], debugInfo: { line: 11, column: 6, length: 30 } },
					],
					debugInfo: { line: 9, column: 5, length: 24 },
				},
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is a reply with a follow-up',
					children: [
						{
							type: StatementType.SAY,
							data: 'Which the player continues to say',
							children: [],
							debugInfo: { line: 13, column: 6, length: 35 },
						},
						{
							type: StatementType.SAY,
							data: 'Like, the same character you play.',
							children: [],
							debugInfo: { line: 14, column: 6, length: 36 },
						},
					],
					debugInfo: { line: 12, column: 5, length: 34 },
				},
				{
					type: StatementType.SAY,
					data: "...and now we're back here after the reply has been replied.",
					children: [],
					debugInfo: { line: 15, column: 5, length: 62 },
				},
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is first of the second set of replies',
					children: [],
					debugInfo: { line: 17, column: 5, length: 44 },
				},
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is second of the second set of replies',
					children: [],
					debugInfo: { line: 18, column: 5, length: 45 },
				},
				{
					type: StatementType.SAY,
					data: 'Very meaningful choices they are, yes.',
					children: [],
					debugInfo: { line: 19, column: 5, length: 40 },
				},
				{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 20, column: 4, length: 9 } },
				{
					type: StatementType.SAY,
					data: 'And at the very end the Worker character can chat as well.',
					children: [],
					debugInfo: { line: 21, column: 5, length: 60 },
				},
			])
			expect(parsedScript.errors).toEqual([])
		})
	})

	describe('chapters', () => {
		it('parses chapters', () => {
			enum Chapters {
				FIRST,
				SECOND,
			}

			const parsedScript = parseTenScript(
				() => `
				Narrator:
				@ This is reply one -> ${Chapters.FIRST}
				@ This is reply two -> ${Chapters.SECOND}
					
				${Chapters.FIRST}:
					Narrator:
					> We are now in the first chapter
						
				${Chapters.SECOND}:
					Narrator:
					> We are now in the second chapter
			`
			)

			expect(parsedScript.errors).toEqual([])
			expect(parsedScript.statements).toEqual([
				{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 1, column: 4, length: 9 } },
				{
					type: StatementType.RESPONSE_CHAPTER,
					data: { text: 'This is reply one', chapterName: Chapters.FIRST.toString() },
					children: [],
					debugInfo: { line: 2, column: 9, length: 20 },
				},
				{
					type: StatementType.RESPONSE_CHAPTER,
					data: { text: 'This is reply two', chapterName: Chapters.SECOND.toString() },
					children: [],
					debugInfo: { line: 3, column: 9, length: 20 },
				},
				{
					type: StatementType.CREATE_CHAPTER,
					data: Chapters.FIRST.toString(),
					children: [
						{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 6, column: 5, length: 9 } },
						{
							type: StatementType.SAY,
							data: 'We are now in the first chapter',
							children: [],
							debugInfo: { line: 7, column: 6, length: 33 },
						},
					],
					debugInfo: { line: 5, column: 4, length: 2 },
				},
				{
					type: StatementType.CREATE_CHAPTER,
					data: Chapters.SECOND.toString(),
					children: [
						{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 10, column: 5, length: 9 } },
						{
							type: StatementType.SAY,
							data: 'We are now in the second chapter',
							children: [],
							debugInfo: { line: 11, column: 6, length: 34 },
						},
					],
					debugInfo: { line: 9, column: 4, length: 2 },
				},
			])
		})

		it('parses text-based chapters', () => {
			enum Chapters {
				FIRST = 'FIRST',
			}

			const parsedScript = parseTenScript(
				() => `
				${Chapters.FIRST}:
					> We are now in the first chapter
			`
			)

			expect(parsedScript.statements).toEqual([
				{
					type: StatementType.CREATE_CHAPTER,
					data: Chapters.FIRST.toLowerCase(),
					children: [
						{
							type: StatementType.SAY,
							data: 'We are now in the first chapter',
							children: [],
							debugInfo: { line: 2, column: 6, length: 33 },
						},
					],
					debugInfo: { line: 1, column: 4, length: 6 },
				},
			])
			expect(parsedScript.errors.length).toBe(0)
		})

		it('does not output statements if errors are found', () => {
			const parsedScript = parseTenScript(
				() => `
				> Line before
				--> ${StoryCharacter.NARRATOR}
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.statements.length).toBe(0)
		})

		it('disallows empty chapter name in move statement', () => {
			const parsedScript = parseTenScript(
				() => `
				--> 
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toBe(ParseErrorType.EMPTY_CHAPTER_NAME)
		})

		it('disallows empty chapter name in chapter response statement', () => {
			const parsedScript = parseTenScript(
				() => `
				@ Move ->
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toBe(ParseErrorType.EMPTY_CHAPTER_NAME)
		})

		it('disallows character name collision in move statement', () => {
			const parsedScript = parseTenScript(
				() => `
				--> ${StoryCharacter.NARRATOR}
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toBe(ParseErrorType.CHAPTER_NAMED_AS_CHARACTER)
		})

		it('disallows character name collision in response statement', () => {
			const parsedScript = parseTenScript(
				() => `
				@ Responding -> ${StoryCharacter.NARRATOR}
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toBe(ParseErrorType.CHAPTER_NAMED_AS_CHARACTER)
		})
	})

	describe('different characters', () => {
		it('say statement allows all common characters', () => {
			const parsedScript = parseTenScript(
				() => `
				> ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
			`
			)

			expect(parsedScript.errors).toEqual([])
			expect(parsedScript.statements).toEqual([
				{
					type: StatementType.SAY,
					data: '... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".',
					children: [],
					debugInfo: { line: 1, column: 5, length: 83 },
				},
			])
		})

		it('response statement allows all common characters', () => {
			const parsedScript = parseTenScript(
				() => `
				@ ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
			`
			)

			expect(parsedScript.errors).toEqual([])
			expect(parsedScript.statements).toEqual([
				{
					type: StatementType.RESPONSE_INLINE,
					data: '... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".',
					children: [],
					debugInfo: { line: 1, column: 5, length: 83 },
				},
			])
		})
	})

	describe('response has dashes', () => {
		it('does not consume dashes or spaces', () => {
			const parsedScript = parseTenScript(
				() => `
				@ This is a reply with - a few - dashes
			`
			)

			expect(parsedScript.statements).toEqual([
				{
					type: StatementType.RESPONSE_INLINE,
					data: 'This is a reply with - a few - dashes',
					children: [],
					debugInfo: { line: 1, column: 5, length: 39 },
				},
			])
			expect(parsedScript.errors.length).toBe(0)
		})
	})

	describe('speaker with children', () => {
		it('throws an error', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
					> Me talk once
					> Me talk twice
			`
			)

			expect(parsedScript.errors.length).toEqual(1)
			expect(parsedScript.errors[0].code).toEqual(ParseErrorType.LEAF_NODE_CHILDREN)
		})
	})

	describe('unconditional move statement', () => {
		it('parses correctly', () => {
			enum Chapters {
				First,
			}

			const parsedScript = parseTenScript(
				() => `
				> Say statement
				--> ${Chapters.First}
				> Say statement
			`
			)

			expect(parsedScript.errors).toEqual([])
			expect(parsedScript.statements).toEqual([
				{ type: StatementType.SAY, data: 'Say statement', children: [], debugInfo: { line: 1, column: 5, length: 15 } },
				{ type: StatementType.MOVE, data: Chapters.First.toString(), children: [], debugInfo: { line: 2, column: 7, length: 3 } },
				{ type: StatementType.SAY, data: 'Say statement', children: [], debugInfo: { line: 3, column: 5, length: 15 } },
			])
		})
	})

	describe('move statement has children', () => {
		it('returns the error', () => {
			const parsedScript = parseTenScript(
				() => `
				--> Unconditional move
					> This is a bad statement
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toEqual(ParseErrorType.LEAF_NODE_CHILDREN)
		})
	})

	describe('speaker statement has no children', () => {
		it('parses correctly', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
				> This is an error
			`
			)

			expect(parsedScript.statements).toEqual([
				{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NARRATOR, children: [], debugInfo: { line: 1, column: 4, length: 9 } },
				{ type: StatementType.SAY, data: 'This is an error', children: [], debugInfo: { line: 2, column: 5, length: 18 } },
			])
			expect(parsedScript.errors.length).toBe(0)
		})
	})

	describe('mixed indentation', () => {
		it('parses tabs', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
				> This line has tabs
			`
			)

			expect(parsedScript.errors.length).toBe(0)
		})

		it('parses spaces', () => {
			const parsedScript = parseTenScript(
				() => `
                Narrator:
                > This line has spaces
			`
			)

			expect(parsedScript.errors.length).toBe(0)
		})

		it('parses trailing spaces', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator: 
				> Some text
			`
			)

			expect(parsedScript.errors.length).toBe(0)
		})

		it('throws an error if both are used together', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
				> This line has tabs
                > This line has spaces
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toEqual(ParseErrorType.MIXED_INDENTATION)
		})
	})

	describe('camel-case character name', () => {
		it('parses correctly', () => {
			const parsedScript = parseTenScript(
				() => `
				${StoryCharacter.NOT_NESSA}:
				> Nessa line
			`
			)

			expect(parsedScript.statements).toEqual([
				{ type: StatementType.SET_SPEAKER, data: StoryCharacter.NOT_NESSA, children: [], debugInfo: { line: 1, column: 4, length: 9 } },
				{ type: StatementType.SAY, data: 'Nessa line', children: [], debugInfo: { line: 2, column: 5, length: 12 } },
			])
			expect(parsedScript.errors.length).toBe(0)
		})

		it('parses spaces', () => {
			const parsedScript = parseTenScript(
				() => `
                Narrator:
                > This line has spaces
			`
			)

			expect(parsedScript.errors.length).toBe(0)
		})

		it('throws an error if both are used together', () => {
			const parsedScript = parseTenScript(
				() => `
				Narrator:
				> This line has tabs
                > This line has spaces
			`
			)

			expect(parsedScript.errors.length).toBe(1)
			expect(parsedScript.errors[0].code).toEqual(ParseErrorType.MIXED_INDENTATION)
		})
	})
})
