import { setupTestGame, TestGame } from '@src/utils/TestGame'

import TutorialHeroTroviar from '../../cards/13-special/cards/TutorialHeroTroviar'
import TutorialSpellFleetingSpark from '../../cards/13-special/cards/TutorialSpellFleetingSpark'
import TutorialSpellScrollOfGrowth from '../../cards/13-special/cards/TutorialSpellScrollOfGrowth'
import TutorialSpellShadowSpark from '../../cards/13-special/cards/TutorialSpellShadowSpark'
import TutorialSpellSteelSpark from '../../cards/13-special/cards/TutorialSpellSteelSpark'
import TutorialUnitEagleEyeArcher from '../../cards/13-special/cards/TutorialUnitEagleEyeArcher'
import TutorialUnitPriestessOfAedine from '../../cards/13-special/cards/TutorialUnitPriestessOfAedine'
import TutorialUnitSparklingSpirit from '../../cards/13-special/cards/TutorialUnitSparklingSpirit'
import TutorialUnitStormElemental from '../../cards/13-special/cards/TutorialUnitStormElemental'
import TutorialUnitWoundedVeteran from '../../cards/13-special/cards/TutorialUnitWoundedVeteran'
import RulesetTutorialBasic from './RulesetTutorialBasic'

describe('RulesetTutorialBasic', () => {
	let game: TestGame

	const playFirstRoundCorrectly = () => {
		game.novel.clickThroughDialogue()
		game.player.find(TutorialUnitWoundedVeteran).play()
		game.novel.clickThroughDialogue()

		game.player.find(TutorialUnitPriestessOfAedine).play().targetFirst()
		game.novel.clickThroughDialogue()
		game.player.endRound()
		game.novel.clickThroughDialogue()

		game.novel.selectFirstResponse()
		game.novel.clickThroughDialogue()
	}

	const playSecondRoundCorrectly = () => {
		game.player.find(TutorialHeroTroviar).play()
		game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
		game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
		game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
		game.player.endRound()

		game.novel.clickThroughDialogue()
	}

	const playThirdRoundCorrectly = (requestExtraRound: boolean) => {
		game.player.find(TutorialSpellShadowSpark).play().targetFirst()
		game.player.find(TutorialSpellFleetingSpark).play().targetFirst()
		game.player.find(TutorialSpellScrollOfGrowth).play().targetFirst()
		game.player.find(TutorialUnitStormElemental).play()

		if (requestExtraRound) {
			game.novel.selectFirstResponse()
		} else {
			game.novel.selectSecondResponse()
		}
		game.novel.clickThroughDialogue()
	}

	const playExtraRoundCorrectly = () => {
		game.player.find(TutorialUnitSparklingSpirit).play()

		game.player.find(TutorialUnitSparklingSpirit).play()
		game.player.find(TutorialSpellFleetingSpark).play().targetFirst()
		game.player.find(TutorialSpellFleetingSpark).play().targetFirst()
		game.player.find(TutorialSpellSteelSpark).play().targetFirst()

		game.player.find(TutorialUnitStormElemental).play()
		game.player.find(TutorialSpellSteelSpark).play().targetFirst()
		game.player.find(TutorialSpellShadowSpark).play().targetFirst()

		game.player.find(TutorialUnitStormElemental).play()
		game.player.find(TutorialSpellSteelSpark).play().targetFirst()
		game.player.find(TutorialSpellShadowSpark).play().targetFirst()

		game.player.find(TutorialUnitStormElemental).play()
		game.player.find(TutorialSpellSteelSpark).play().targetFirst()
		game.player.find(TutorialSpellShadowSpark).play().targetFirst()
		game.player.endRound()

		game.novel.clickThroughDialogue()
	}

	beforeEach(() => {
		game = setupTestGame(RulesetTutorialBasic)
	})

	describe('when played correctly', () => {
		beforeEach(() => {
			playFirstRoundCorrectly()
			playSecondRoundCorrectly()
			playThirdRoundCorrectly(true)
			playExtraRoundCorrectly()
		})

		it('completes the scenario successfully', () => {
			expect(game.result.isFinished()).toEqual(true)
			expect(game.result.victoriousGroup()).toEqual('first')
		})
	})

	describe('when trying to end round early on stage 1', () => {
		describe('in the beginning', () => {
			beforeEach(() => {
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
			})

			it('does not create a post-dialog action', () => {
				expect(game.novel.hasQueuedAction()).toEqual(false)
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(0)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})
		})

		describe('after playing one card', () => {
			beforeEach(() => {
				game.novel.clickThroughDialogue()
				game.player.find(TutorialUnitWoundedVeteran).play()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
			})

			it('does not create a post-dialog action', () => {
				expect(game.novel.hasQueuedAction()).toEqual(false)
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(0)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})
		})

		describe('repeatedly', () => {
			beforeEach(() => {
				game.novel.clickThroughDialogue()
				game.player.find(TutorialUnitWoundedVeteran).play()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(0)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			describe('when finishing dialog', () => {
				beforeEach(() => {
					game.novel.clickThroughDialogue()
				})

				it('finishes the game', () => {
					expect(game.result.isFinished()).toEqual(true)
					expect(game.result.victoriousGroup()).toEqual('second')
				})
			})
		})
	})

	describe('when trying to end round early on stage 2', () => {
		describe('in the beginning', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()

				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(1)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})
		})

		describe('after playing cards', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()

				game.player.find(TutorialHeroTroviar).play()
				game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(1)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			it('does not add cards', () => {
				expect(game.player.countInHand(TutorialHeroTroviar)).toEqual(0)
				expect(game.player.countInHand(TutorialUnitEagleEyeArcher)).toEqual(2)
			})

			it('does not reset the board', () => {
				expect(game.board.count(TutorialHeroTroviar)).toEqual(1)
				expect(game.board.count(TutorialUnitEagleEyeArcher)).toEqual(1)
				expect(game.board.count(TutorialUnitWoundedVeteran)).toEqual(1)
				expect(game.board.count(TutorialUnitPriestessOfAedine)).toEqual(1)
			})
		})

		describe('repeatedly', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()

				game.player.find(TutorialHeroTroviar).play()
				game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(1)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			it('does not add cards', () => {
				expect(game.player.countInHand(TutorialHeroTroviar)).toEqual(0)
				expect(game.player.countInHand(TutorialUnitEagleEyeArcher)).toEqual(2)
			})

			it('does not reset the board', () => {
				expect(game.board.count(TutorialHeroTroviar)).toEqual(1)
				expect(game.board.count(TutorialUnitEagleEyeArcher)).toEqual(1)
				expect(game.board.count(TutorialUnitWoundedVeteran)).toEqual(1)
				expect(game.board.count(TutorialUnitPriestessOfAedine)).toEqual(1)
			})
		})
	})

	describe('when trying to end round early on stage 3', () => {
		describe('after playing some spells', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()
				playSecondRoundCorrectly()
				game.player.find(TutorialSpellShadowSpark).play().targetFirst()
				game.player.find(TutorialSpellFleetingSpark).play().targetFirst()
				game.player.tryToEndRound()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(2)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			it('does not reset the board', () => {
				expect(game.board.countAll()).toBeGreaterThan(0)
			})

			it('does not reset the hand', () => {
				expect(game.player.countInHand(TutorialUnitStormElemental)).toEqual(1)
				expect(game.player.countInHand(TutorialSpellScrollOfGrowth)).toEqual(1)
				expect(game.player.countInHand(TutorialSpellShadowSpark)).toEqual(0)
				expect(game.player.countInHand(TutorialSpellFleetingSpark)).toEqual(0)
			})
		})

		describe('repeatedly', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()
				playSecondRoundCorrectly()
				game.player.find(TutorialSpellShadowSpark).play().targetFirst()
				game.player.find(TutorialSpellFleetingSpark).play().targetFirst()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
				game.player.tryToEndRound()
				game.novel.clickThroughDialogue()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(2)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			it('does not reset the board', () => {
				expect(game.board.countAll()).toBeGreaterThan(0)
			})

			it('does not reset the hand', () => {
				expect(game.player.countInHand(TutorialUnitStormElemental)).toEqual(1)
				expect(game.player.countInHand(TutorialSpellScrollOfGrowth)).toEqual(1)
				expect(game.player.countInHand(TutorialSpellShadowSpark)).toEqual(0)
				expect(game.player.countInHand(TutorialSpellFleetingSpark)).toEqual(0)
			})
		})
	})

	describe('when trying to play the unit early on stage 3', () => {
		describe('once', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()
				playSecondRoundCorrectly()
			})

			it('does not allow the card to be played', () => {
				expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
				expect(game.board.count(TutorialUnitStormElemental)).toEqual(0)
				expect(game.player.countInHand(TutorialUnitStormElemental)).toEqual(1)
			})

			it('creates the dialogue', () => {
				expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
				expect(game.novel.countResponseStatements()).toBeGreaterThan(0)
			})
		})

		describe('many times', () => {
			beforeEach(() => {
				playFirstRoundCorrectly()
				playSecondRoundCorrectly()
			})

			it('does not allow the card to be played', () => {
				expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
				game.novel.selectSecondResponse()
				expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
				expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
				expect(game.board.count(TutorialUnitStormElemental)).toEqual(0)
				expect(game.player.countInHand(TutorialUnitStormElemental)).toEqual(1)
			})
		})
	})

	describe('when failing on stage 2', () => {
		beforeEach(() => {
			playFirstRoundCorrectly()

			game.player.find(TutorialUnitEagleEyeArcher).play()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialHeroTroviar).play()
			game.player.tryToEndRound()
		})

		it('only creates one move statement', () => {
			expect(game.novel.countMoveStatements()).toEqual(1)
		})

		it("does not end the opponent's turn", () => {
			expect(game.opponent.handle.group.roundEnded).toBeFalsy()
		})

		describe('after finishing dialogue', () => {
			beforeEach(() => {
				game.novel.clickThroughDialogue()
			})

			it('does not allow the round to end', () => {
				expect(game.handle.players[0].roundWins).toEqual(1)
				expect(game.handle.players[1].roundWins).toEqual(0)
			})

			it('resets the hand', () => {
				expect(game.player.countInHand(TutorialHeroTroviar)).toEqual(1)
				expect(game.player.countInHand(TutorialUnitEagleEyeArcher)).toEqual(3)
			})

			it('resets the opponent', () => {
				expect(game.opponent.countInHand(TutorialUnitWoundedVeteran)).toEqual(1)
				expect(game.opponent.countInHand(TutorialUnitPriestessOfAedine)).toEqual(3)
			})

			it('resets the board', () => {
				expect(game.board.countAll()).toEqual(0)
			})

			describe('after failing again', () => {
				beforeEach(() => {
					game.player.find(TutorialUnitEagleEyeArcher).play()
					game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
					game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
					game.player.find(TutorialHeroTroviar).play()
					game.player.tryToEndRound()
				})

				it('only creates one move statement', () => {
					expect(game.novel.countMoveStatements()).toEqual(1)
				})

				describe('after finishing dialogue', () => {
					beforeEach(() => {
						game.novel.clickThroughDialogue()
					})

					it('does not allow the round to end', () => {
						expect(game.handle.players[0].roundWins).toEqual(1)
						expect(game.handle.players[1].roundWins).toEqual(0)
					})

					it('resets the hand with an extra card', () => {
						expect(game.player.countInHand(TutorialHeroTroviar)).toEqual(1)
						expect(game.player.countInHand(TutorialUnitEagleEyeArcher)).toEqual(4)
					})

					it('resets the opponent', () => {
						expect(game.opponent.countInHand(TutorialUnitWoundedVeteran)).toEqual(1)
						expect(game.opponent.countInHand(TutorialUnitPriestessOfAedine)).toEqual(3)
					})

					it('resets the board', () => {
						expect(game.board.countAll()).toEqual(0)
					})

					describe('after failing again', () => {
						beforeEach(() => {
							game.player.find(TutorialUnitEagleEyeArcher).play()
							game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
							game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
							game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
							game.player.find(TutorialHeroTroviar).play()
							game.player.tryToEndRound()
						})

						it('only creates one move statement', () => {
							expect(game.novel.countMoveStatements()).toEqual(1)
						})

						describe('after finishing dialogue', () => {
							beforeEach(() => {
								game.novel.clickThroughDialogue()
							})

							it('does not allow the round to end', () => {
								expect(game.handle.players[0].roundWins).toEqual(1)
								expect(game.handle.players[1].roundWins).toEqual(0)
							})

							it('resets the hand with many extra cards', () => {
								expect(game.player.countInHand(TutorialHeroTroviar)).toEqual(1)
								expect(game.player.countInHand(TutorialUnitEagleEyeArcher)).toEqual(19)
							})

							it('resets the opponent', () => {
								expect(game.opponent.countInHand(TutorialUnitWoundedVeteran)).toEqual(1)
								expect(game.opponent.countInHand(TutorialUnitPriestessOfAedine)).toEqual(3)
							})

							it('resets the board', () => {
								expect(game.board.countAll()).toEqual(0)
							})
						})
					})
				})
			})
		})
	})

	describe('when trying to trigger the secret ending', () => {
		beforeEach(() => {
			game.novel.clickThroughDialogue()
			game.player.tryToEndRound()
			game.novel.clickThroughDialogue()
			game.player.tryToEndRound()

			playFirstRoundCorrectly()

			game.player.find(TutorialUnitEagleEyeArcher).play()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialHeroTroviar).play()
			game.player.tryToEndRound()
			game.novel.clickThroughDialogue()
			game.player.find(TutorialUnitEagleEyeArcher).play()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialHeroTroviar).play()
			game.player.tryToEndRound()
			game.novel.clickThroughDialogue()
			game.player.find(TutorialUnitEagleEyeArcher).play()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialUnitEagleEyeArcher).play().targetFirst()
			game.player.find(TutorialHeroTroviar).play()
			game.player.tryToEndRound()
			game.novel.clickThroughDialogue()
			game.player.find(TutorialHeroTroviar).play()
			for (let i = 0; i < 10; i++) {
				game.player.find(TutorialUnitEagleEyeArcher).playTo('front').targetFirst()
			}
			for (let i = 0; i < 9; i++) {
				game.player.find(TutorialUnitEagleEyeArcher).playTo('middle').targetFirst()
			}
			game.player.endRound()

			game.novel.clickThroughDialogue()
			expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
			game.novel.selectSecondResponse()
			game.novel.clickThroughDialogue()
			expect(() => game.player.find(TutorialUnitStormElemental).play()).toThrow()
		})

		it('triggers the secret ending', () => {
			expect(game.novel.countResponseStatements()).toEqual(3)
		})

		describe('when finishing secret ending dialog', () => {
			beforeEach(() => {
				game.novel.selectFirstResponse()
				game.novel.clickThroughDialogue()
				game.novel.clickThroughDialogue()
				game.novel.selectFirstResponse()
				game.novel.clickThroughDialogue()
				game.novel.clickThroughDialogue()
			})

			it('finishes the game', () => {
				expect(game.result.isFinished()).toEqual(true)
				expect(game.result.victoriousGroup()).toEqual('first')
			})
		})
	})
})
