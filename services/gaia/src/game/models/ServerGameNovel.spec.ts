import StoryCharacter from '@shared/enums/StoryCharacter'
import {
	AnimationMessageType,
	NovelMessageType,
	ServerToClientGameMessage,
} from '@shared/models/network/messageHandlers/ServerToClientGameMessages'

import { setupTestGame } from '../../utils/TestGame'
import { safeWhile } from '../../utils/Utils'
import TestingRulesetPVP from '../rulesets/testing/TestingRulesetPVP'
import ServerGame from './ServerGame'

describe('ServerGameNovel', () => {
	let game: ServerGame
	let spy: jest.SpyInstance<void, [json: ServerToClientGameMessage]>

	const getSentMessages = (fromIndex = 0) => spy.mock.calls.map((call) => call[0]).slice(fromIndex)

	beforeEach(() => {
		const testGame = setupTestGame(TestingRulesetPVP)
		game = testGame.handle
		spy = jest.spyOn(testGame.player.handle.player.gameWebSocket!, 'send')
	})

	describe('for a simple case', () => {
		beforeEach(() => {
			game.novel.startDialog(`
				Narrator:
				> Hello world
			`)
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.ACTIVATE_CHARACTER)
			expect(messages[2].type).toEqual(NovelMessageType.SAY)
			if (messages[2].type === NovelMessageType.SAY) {
				expect(messages[2].data.text).toEqual('Hello world')
			}
			expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[4].type).toEqual(NovelMessageType.CONTINUE)
			expect(messages.length).toEqual(5)
		})
	})

	describe('for a nested dialog', () => {
		beforeEach(() => {
			game.novel.startDialog(`
				@ Option A
					> Option A response
				@ Option B
					> Option B response
				> After option selected
			`)
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[1].type === NovelMessageType.ADD_REPLY) {
				expect(messages[1].data.text).toEqual('Option A')
			}
			expect(messages[2].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[2].type === NovelMessageType.ADD_REPLY) {
				expect(messages[2].data.text).toEqual('Option B')
			}
			expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
			expect(messages.length).toEqual(4)
		})

		describe('on response selected', () => {
			beforeEach(() => {
				const messages = getSentMessages()
				let chapterOfA = ''
				if (messages[1].type === NovelMessageType.ADD_REPLY) {
					chapterOfA = messages[1].data.chapterId
				} else {
					throw new Error('Invalid argument')
				}
				game.novel.executeChapter(chapterOfA)
			})

			it('sends valid messages', () => {
				const messages = getSentMessages(4)

				expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
				expect(messages[1].type).toEqual(NovelMessageType.MUTE)
				expect(messages[2].type).toEqual(NovelMessageType.SAY)
				if (messages[2].type === NovelMessageType.SAY) {
					expect(messages[2].data.text).toEqual('Option A response')
				}
				expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
				expect(messages[4].type).toEqual(NovelMessageType.CONTINUE)
				expect(messages.length).toEqual(5)
			})

			describe('on continue', () => {
				beforeEach(() => {
					safeWhile(() => game.novel.popClientStateCue())
					game.novel.continueQueue()
				})

				it('sends valid messages', () => {
					const messages = getSentMessages(9)

					expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
					expect(messages[1].type).toEqual(NovelMessageType.SAY)
					if (messages[1].type === NovelMessageType.SAY) {
						expect(messages[1].data.text).toEqual('After option selected')
					}
					expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
					expect(messages[3].type).toEqual(NovelMessageType.CONTINUE)
					expect(messages.length).toEqual(4)
				})

				describe('on continue again', () => {
					beforeEach(() => {
						safeWhile(() => game.novel.popClientStateCue())
						game.novel.continueQueue()
					})

					it('sends dialog end message', () => {
						const messages = getSentMessages(14)

						expect(messages[0].type).toEqual(NovelMessageType.END)
					})
				})
			})
		})
	})

	describe('for a script-defined chapter', () => {
		beforeEach(() => {
			game.novel
				.startDialog(
					`
					@ Option A -> OptionA
					@ Option B -> OptionB
					> After option selected
				`
				)
				.chapter('OptionA', () => '> Option A response')
				.chapter('OptionB', () => '> Option B response')
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[1].type === NovelMessageType.ADD_REPLY) {
				expect(messages[1].data.text).toEqual('Option A')
				expect(messages[1].data.chapterId.split('/')[1]).toEqual('OptionA'.toLowerCase())
			}
			expect(messages[2].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[2].type === NovelMessageType.ADD_REPLY) {
				expect(messages[2].data.text).toEqual('Option B')
				expect(messages[2].data.chapterId.split('/')[1]).toEqual('OptionB'.toLowerCase())
			}
			expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
			expect(messages.length).toEqual(4)
		})

		describe('on response selected', () => {
			beforeEach(() => {
				const messages = getSentMessages()
				let chapterOfA = ''
				if (messages[1].type === NovelMessageType.ADD_REPLY) {
					chapterOfA = messages[1].data.chapterId
				} else {
					throw new Error('Invalid argument')
				}
				game.novel.executeChapter(chapterOfA)
			})

			it('sends valid messages', () => {
				const messages = getSentMessages(4)

				expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
				expect(messages[1].type).toEqual(NovelMessageType.MUTE)
				expect(messages[2].type).toEqual(NovelMessageType.SAY)
				if (messages[2].type === NovelMessageType.SAY) {
					expect(messages[2].data.text).toEqual('Option A response')
				}
				expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
				expect(messages[4].type).toEqual(NovelMessageType.CONTINUE)
				expect(messages.length).toEqual(5)
			})

			describe('on continue', () => {
				beforeEach(() => {
					safeWhile(() => game.novel.popClientStateCue())
					game.novel.continueQueue()
				})

				it('sends valid messages', () => {
					const messages = getSentMessages(9)

					expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
					expect(messages[1].type).toEqual(NovelMessageType.SAY)
					if (messages[1].type === NovelMessageType.SAY) {
						expect(messages[1].data.text).toEqual('After option selected')
					}
					expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
					expect(messages[3].type).toEqual(NovelMessageType.CONTINUE)
					expect(messages.length).toEqual(4)
				})

				describe('on continue again', () => {
					beforeEach(() => {
						safeWhile(() => game.novel.popClientStateCue())
						game.novel.continueQueue()
					})

					it('sends dialog end message', () => {
						const messages = getSentMessages(14)

						expect(messages[0].type).toEqual(NovelMessageType.END)
					})
				})
			})
		})
	})

	describe('for a creator-defined chapter', () => {
		beforeEach(() => {
			game.novel
				.startDialog(
					`
					@ Option A -> OptionA
					@ Option B -> OptionB
					> After option selected
				`
				)
				.continue('OptionA', (novel) => novel.exec('> Option A response'))
				.continue('OptionB', (novel) => novel.exec('> Option B response'))
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[1].type === NovelMessageType.ADD_REPLY) {
				expect(messages[1].data.text).toEqual('Option A')
				expect(messages[1].data.chapterId.split('/')[1]).toEqual('OptionA'.toLowerCase())
			}
			expect(messages[2].type).toEqual(NovelMessageType.ADD_REPLY)
			if (messages[2].type === NovelMessageType.ADD_REPLY) {
				expect(messages[2].data.text).toEqual('Option B')
				expect(messages[2].data.chapterId.split('/')[1]).toEqual('OptionB'.toLowerCase())
			}
			expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
			expect(messages.length).toEqual(4)
		})

		describe('on response selected', () => {
			beforeEach(() => {
				const messages = getSentMessages()
				let chapterOfA = ''
				if (messages[1].type === NovelMessageType.ADD_REPLY) {
					chapterOfA = messages[1].data.chapterId
				} else {
					throw new Error('Invalid argument')
				}
				game.novel.executeChapter(chapterOfA)
			})

			it('sends valid messages', () => {
				const messages = getSentMessages(4)

				expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
				expect(messages[1].type).toEqual(NovelMessageType.MUTE)
				expect(messages[2].type).toEqual(NovelMessageType.SAY)
				if (messages[2].type === NovelMessageType.SAY) {
					expect(messages[2].data.text).toEqual('Option A response')
				}
				expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
				expect(messages[4].type).toEqual(NovelMessageType.CONTINUE)
				expect(messages.length).toEqual(5)
			})

			describe('on continue', () => {
				beforeEach(() => {
					safeWhile(() => game.novel.popClientStateCue())
					game.novel.continueQueue()
				})

				it('sends valid messages', () => {
					const messages = getSentMessages(9)

					expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
					expect(messages[1].type).toEqual(NovelMessageType.SAY)
					if (messages[1].type === NovelMessageType.SAY) {
						expect(messages[1].data.text).toEqual('After option selected')
					}
					expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
					expect(messages[3].type).toEqual(NovelMessageType.CONTINUE)
					expect(messages.length).toEqual(4)
				})

				describe('on continue again', () => {
					beforeEach(() => {
						safeWhile(() => game.novel.popClientStateCue())
						game.novel.continueQueue()
					})

					it('sends dialog end message', () => {
						const messages = getSentMessages(14)

						expect(messages[0].type).toEqual(NovelMessageType.END)
					})
				})
			})
		})
	})

	describe('for multiple dialogs in succession', () => {
		beforeEach(() => {
			game.novel.startDialog('> First dialog option')
			safeWhile(() => game.novel.popClientStateCue())
			game.novel.continueQueue()
			game.novel.startDialog('> Second dialog option')
			safeWhile(() => game.novel.popClientStateCue())
			game.novel.continueQueue()
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.SAY)
			if (messages[1].type === NovelMessageType.SAY) {
				expect(messages[1].data.text).toEqual('First dialog option')
			}
			expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[3].type).toEqual(NovelMessageType.CONTINUE)
			expect(messages[4].type).toEqual(NovelMessageType.CLEAR)
			expect(messages[5].type).toEqual(NovelMessageType.END)
			expect(messages[6].type).toEqual(NovelMessageType.START)
			expect(messages[7].type).toEqual(NovelMessageType.SAY)
			if (messages[7].type === NovelMessageType.SAY) {
				expect(messages[7].data.text).toEqual('Second dialog option')
			}
			expect(messages[8].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[9].type).toEqual(NovelMessageType.CONTINUE)
			expect(messages[10].type).toEqual(NovelMessageType.CLEAR)
			expect(messages[11].type).toEqual(NovelMessageType.END)
			expect(messages.length).toEqual(12)
		})
	})

	describe('unconditional move into closing chapter', () => {
		let callbackExecuted = 0

		beforeEach(() => {
			callbackExecuted = 0
			game.novel
				.startDialog(
					`
					> First dialog option
					--> Chapter
				`
				)
				.actionChapter('Chapter', () => {
					callbackExecuted += 1
				})
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.SAY)
			if (messages[1].type === NovelMessageType.SAY) {
				expect(messages[1].data.text).toEqual('First dialog option')
			}
			expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[3].type).toEqual(NovelMessageType.MOVE)
			expect(messages.length).toEqual(4)
		})

		describe('when jumping into chapter', () => {
			let chapterId: string

			beforeEach(() => {
				const messages = getSentMessages()
				let chapterOfA = ''
				if (messages[3].type === NovelMessageType.MOVE) {
					chapterOfA = messages[3].data.chapterId
				} else {
					throw new Error('Invalid argument')
				}
				chapterId = chapterOfA
			})

			it('executes chapter callback exactly once', () => {
				game.novel.executeChapter(chapterId)
				expect(callbackExecuted).toEqual(1)
			})
		})
	})

	describe('unconditional move into standard chapter', () => {
		beforeEach(() => {
			game.novel
				.startDialog(
					`
				> First dialog option
				--> Chapter
				> First dialog continues
			`
				)
				.chapter(
					'Chapter',
					() => `
					> Chapter dialog
				`
				)
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.SAY)
			if (messages[1].type === NovelMessageType.SAY) {
				expect(messages[1].data.text).toEqual('First dialog option')
			}
			expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[3].type).toEqual(NovelMessageType.MOVE)
			expect(messages.length).toEqual(4)
		})

		describe('when jumping into chapter', () => {
			beforeEach(() => {
				const messages = getSentMessages()
				let chapterOfA = ''
				if (messages[3].type === NovelMessageType.MOVE) {
					chapterOfA = messages[3].data.chapterId
				} else {
					throw new Error('Invalid argument')
				}
				game.novel.executeChapter(chapterOfA)
			})

			it('executes chapter', () => {
				const messages = getSentMessages(4)

				expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
				expect(messages[1].type).toEqual(NovelMessageType.MUTE)
				expect(messages[2].type).toEqual(NovelMessageType.SAY)
				if (messages[2].type === NovelMessageType.SAY) {
					expect(messages[2].data.text).toEqual('Chapter dialog')
				}
				expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
				expect(messages[4].type).toEqual(NovelMessageType.CONTINUE)
				expect(messages.length).toEqual(5)
			})

			describe('on continue', () => {
				beforeEach(() => {
					safeWhile(() => game.novel.popClientStateCue())
					game.novel.continueQueue()
				})

				it('executes chapter', () => {
					const messages = getSentMessages(9)

					expect(messages[0].type).toEqual(NovelMessageType.CLEAR)
					expect(messages[1].type).toEqual(NovelMessageType.SAY)
					if (messages[1].type === NovelMessageType.SAY) {
						expect(messages[1].data.text).toEqual('First dialog continues')
					}
					expect(messages[2].type).toEqual(AnimationMessageType.PLAY)
					expect(messages[3].type).toEqual(NovelMessageType.CONTINUE)
					expect(messages.length).toEqual(4)
				})

				describe('on continue again', () => {
					beforeEach(() => {
						safeWhile(() => game.novel.popClientStateCue())
						game.novel.continueQueue()
					})

					it('ends dialog', () => {
						const messages = getSentMessages(14)
						expect(messages[0].type).toEqual(NovelMessageType.END)
					})
				})
			})
		})
	})

	describe('multiple speakers', () => {
		beforeEach(() => {
			game.novel.startDialog(
				`
					${StoryCharacter.NARRATOR}:
					> Narrator line
					${StoryCharacter.NOT_NESSA}:
					> Elsa line
					${StoryCharacter.NARRATOR}:
					> Another narrator line
			`
			)
		})

		it('sends valid messages', () => {
			const messages = getSentMessages()

			expect(messages[0].type).toEqual(NovelMessageType.START)
			expect(messages[1].type).toEqual(NovelMessageType.ACTIVATE_CHARACTER)
			if (messages[1].type === NovelMessageType.ACTIVATE_CHARACTER) {
				expect(messages[1].data).toEqual(StoryCharacter.NARRATOR)
			}
			expect(messages[2].type).toEqual(NovelMessageType.SAY)
			if (messages[2].type === NovelMessageType.SAY) {
				expect(messages[2].data.text).toEqual('Narrator line')
			}
			expect(messages[3].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[4].type).toEqual(NovelMessageType.ACTIVATE_CHARACTER)
			if (messages[4].type === NovelMessageType.ACTIVATE_CHARACTER) {
				expect(messages[4].data).toEqual(StoryCharacter.NOT_NESSA)
			}
			expect(messages[5].type).toEqual(NovelMessageType.SAY)
			if (messages[5].type === NovelMessageType.SAY) {
				expect(messages[5].data.text).toEqual('Elsa line')
			}
			expect(messages[6].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[7].type).toEqual(NovelMessageType.ACTIVATE_CHARACTER)
			if (messages[7].type === NovelMessageType.ACTIVATE_CHARACTER) {
				expect(messages[7].data).toEqual(StoryCharacter.NARRATOR)
			}
			expect(messages[8].type).toEqual(NovelMessageType.SAY)
			if (messages[8].type === NovelMessageType.SAY) {
				expect(messages[8].data.text).toEqual('Another narrator line')
			}
			expect(messages[9].type).toEqual(AnimationMessageType.PLAY)
			expect(messages[10].type).toEqual(NovelMessageType.CONTINUE)
			expect(messages.length).toEqual(11)
		})
	})
})
