import { setupTestGame, TestGame } from '@src/utils/TestGame'

import TestingBuffBoon from '../buffs/11-testing/TestingBuffBoon'
import TestingBuffHazard from '../buffs/11-testing/TestingBuffHazard'
import BuffGwentRowFrost from '../buffs/14-gwent/BuffGwentRowFrost'
import TestingUnit1Power from '../cards/11-testing/TestingUnit1Power'
import TestingUnit2Power from '../cards/11-testing/TestingUnit2Power'
import TestingUnit11BotScore from '../cards/11-testing/TestingUnit11BotScore'
import TestingUnit100Power from '../cards/11-testing/TestingUnit100Power'
import TestingRulesetGwentAI from '../rulesets/testing/TestingRulesetGwentAI'

describe('ServerBotPlayerInGame', () => {
	let game: TestGame

	beforeEach(() => {
		game = setupTestGame(TestingRulesetGwentAI)
	})

	describe('when front and back rows are covered with hazards', () => {
		beforeEach(() => {
			game.opponent.getRow('front').buffs.add(TestingBuffHazard)
			game.opponent.getRow('back').buffs.add(TestingBuffHazard)
			game.opponent.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power).play()
		})

		it('plays the card on a row without hazard', () => {
			expect(game.opponent.find(TestingUnit100Power).handle.unit!.boardRow.hasHazard).toEqual(false)
		})
	})

	describe('when front and middle rows are covered with hazards', () => {
		beforeEach(() => {
			game.opponent.getRow('front').buffs.add(TestingBuffHazard)
			game.opponent.getRow('middle').buffs.add(TestingBuffHazard)
			game.opponent.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power).play()
		})

		it('plays the card on a row without hazard', () => {
			expect(game.opponent.find(TestingUnit100Power).handle.unit!.boardRow.hasHazard).toEqual(false)
		})
	})

	describe('when middle and back rows are covered with hazards', () => {
		beforeEach(() => {
			game.opponent.getRow('middle').buffs.add(TestingBuffHazard)
			game.opponent.getRow('back').buffs.add(TestingBuffHazard)
			game.opponent.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power).play()
		})

		it('plays the card on a row without hazard', () => {
			expect(game.opponent.find(TestingUnit100Power).handle.unit!.boardRow.hasHazard).toEqual(false)
		})
	})

	describe('when player finishes round early with a small lead', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.player.endRound()
		})

		it('plays only 2 cards to get the win (and one next round)', () => {
			expect(game.opponent.countInHand(TestingUnit100Power)).toEqual(2)
		})

		it('finishes the round', () => {
			expect(game.player.handle.group.roundWins).toEqual(0)
			expect(game.opponent.handle.group.roundWins).toEqual(1)
		})
	})

	describe('when player finishes round early with a medium lead', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.player.endRound()
		})

		it('does not play cards', () => {
			expect(game.opponent.countInHand(TestingUnit100Power)).toEqual(5)
		})

		it('finishes the round', () => {
			expect(game.player.handle.group.roundWins).toEqual(1)
		})
	})

	describe('when player finishes round early with a massive lead', () => {
		beforeEach(() => {
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.summon(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.player.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.opponent.add(TestingUnit100Power)
			game.player.endRound()
		})

		it('does not play cards', () => {
			expect(game.opponent.countInHand(TestingUnit100Power)).toEqual(3)
		})

		it('finishes the round', () => {
			expect(game.player.handle.group.roundWins).toEqual(1)
		})
	})

	describe('when player finishes round after bot', () => {
		beforeEach(() => {
			game.opponent.getRow('front').buffs.add(BuffGwentRowFrost)
			game.opponent.getRow('middle').buffs.add(BuffGwentRowFrost)
			game.opponent.getRow('back').buffs.add(BuffGwentRowFrost)
			game.player.summon(TestingUnit100Power).takeDamage(BuffGwentRowFrost.DAMAGE)
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.player.endTurn()
			game.opponent.endRound()
			game.player.endRound()
		})

		it('does not trigger frost again', () => {
			expect(game.player.handle.group.roundWins).toEqual(1)
			expect(game.opponent.handle.group.roundWins).toEqual(1)
		})
	})

	describe('when bot finishes round after player', () => {
		beforeEach(() => {
			game.opponent.getRow('front').buffs.add(BuffGwentRowFrost)
			game.opponent.getRow('middle').buffs.add(BuffGwentRowFrost)
			game.opponent.getRow('back').buffs.add(BuffGwentRowFrost)
			game.player.summon(TestingUnit100Power).takeDamage(BuffGwentRowFrost.DAMAGE)
			game.opponent.summon(TestingUnit100Power, 'middle')
			game.player.endRound()
		})

		it('does not trigger frost again', () => {
			expect(game.player.handle.group.roundWins).toEqual(1)
			expect(game.opponent.handle.group.roundWins).toEqual(1)
		})
	})

	describe('round end logic', () => {
		describe('first round', () => {
			describe('when can win with board disadvantage', () => {
				beforeEach(() => {
					game.opponent.getRow('front').buffs.add(BuffGwentRowFrost)
					game.opponent.getRow('middle').buffs.add(BuffGwentRowFrost)
					game.opponent.getRow('back').buffs.add(BuffGwentRowFrost)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summon(TestingUnit100Power, 'front')
					game.opponent.summon(TestingUnit100Power, 'middle')
					game.opponent.summon(TestingUnit100Power, 'back')
					game.player.add(TestingUnit100Power)
					game.player.summon(TestingUnit100Power).takeDamage(3)
					game.player.summon(TestingUnit100Power).takeDamage(2)
					game.player.summon(TestingUnit100Power).takeDamage(2)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when can draw with board disadvantage', () => {
				beforeEach(() => {
					game.opponent.getRow('front').buffs.add(BuffGwentRowFrost)
					game.opponent.getRow('middle').buffs.add(BuffGwentRowFrost)
					game.opponent.getRow('back').buffs.add(BuffGwentRowFrost)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summon(TestingUnit100Power, 'front')
					game.opponent.summon(TestingUnit100Power, 'middle')
					game.opponent.summon(TestingUnit100Power, 'back')
					game.player.add(TestingUnit100Power)
					game.player.summon(TestingUnit100Power).takeDamage(2)
					game.player.summon(TestingUnit100Power).takeDamage(2)
					game.player.summon(TestingUnit100Power).takeDamage(2)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 2 cards advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 1 card advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 14 score advantage and a boon over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit2Power, 7)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 10 score advantage and a hazard over her opponent's units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.summon(TestingUnit100Power)
					game.player.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summon(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit2Power, 5)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 12 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.summon(TestingUnit100Power)
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.summon(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 3 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.summon(TestingUnit100Power)
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.summon(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit1Power, 3)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 1 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.summon(TestingUnit100Power)
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.summon(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 8 score advantage and a hazard over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 4)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage and a hazard on empty row', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.getRow('back').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 1 score advantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.endTurn()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has score disadvantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.player.summonMany(TestingUnit1Power, 1)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})
		})

		describe('after winning first round', () => {
			describe('when bot has 2 cards advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 1 card advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.find(TestingUnit100Power).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 14 score advantage and a boon over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit2Power, 7)
					game.player.find(TestingUnit100Power).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 10 score advantage and a hazard over her opponent's units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.player.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 5)
					game.player.find(TestingUnit100Power).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 12 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.find(TestingUnit11BotScore).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 3 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit1Power, 3)
					game.player.find(TestingUnit11BotScore).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe("when bot has 1 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.find(TestingUnit11BotScore).play()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 8 score advantage and a hazard over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 4)
					game.player.find(TestingUnit100Power).play()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage and a hazard on empty row', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.getRow('back').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.find(TestingUnit100Power).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has 1 score advantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.find(TestingUnit100Power).play()
				})

				it('ends the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(true)
				})
			})

			describe('when bot has score disadvantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.opponent.summon(TestingUnit2Power)
					game.finishCurrentRound()

					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.find(TestingUnit100Power).play()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})
		})

		describe('after losing first round', () => {
			describe('when bot has 2 cards advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 1 card advantage on draw', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 10 score advantage and a boon over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit2Power, 5)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe("when bot has 10 score advantage and a hazard over her opponent's units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.player.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 5)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe("when bot has 12 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe("when bot has 3 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.opponent.summonMany(TestingUnit1Power, 3)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe("when bot has 1 score advantage and a boon over her opponents' units", () => {
				beforeEach(() => {
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.player.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)
					game.opponent.add(TestingUnit11BotScore)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.getRow('front').buffs.add(TestingBuffBoon)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage and a hazard over her units', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.getRow('front').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 12 score advantage and a hazard on empty row', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.getRow('back').buffs.add(TestingBuffHazard)
					game.opponent.summonMany(TestingUnit2Power, 6)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has 1 score advantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})

			describe('when bot has score disadvantage and a card advantage', () => {
				beforeEach(() => {
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.player.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)
					game.opponent.add(TestingUnit100Power)

					game.player.summon(TestingUnit2Power)
					game.finishCurrentRound()
					game.opponent.summonMany(TestingUnit1Power, 1)
					game.player.endTurn()
				})

				it('does not end the round', () => {
					expect(game.opponent.handle.group.roundEnded).toEqual(false)
				})
			})
		})
	})
})
