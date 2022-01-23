import GameEventType from '@shared/enums/GameEventType'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitDestructionReason from '@src/enums/UnitDestructionReason'
import UnitRitesEnchantedDummy from '@src/game/cards/12-rites/enemies/UnitRitesEnchantedDummy'
import UnitRitesTargetDummy from '@src/game/cards/12-rites/enemies/UnitRitesTargetDummy'
import ServerGame from '@src/game/models/ServerGame'
import BaseRulesetRitesEncounter from '@src/game/rulesets/rites/service/BaseRulesetRitesEncounter'
import Keywords from '@src/utils/Keywords'

export default class RulesetRitesAbandonedDummies extends BaseRulesetRitesEncounter {
	constructor(game: ServerGame) {
		super(game, {
			constants: {
				ROUND_WINS_REQUIRED: 1,
			},
		})

		this.createBoard().bot([[UnitRitesEnchantedDummy], [UnitRitesTargetDummy, UnitRitesTargetDummy]])

		this.createObjective({
			en: {
				title: 'Assassination',
				description: 'Destroy the Enchanted Dummy.',
			},
		})

		this.createCallback(GameEventType.GAME_SETUP)
			.perform(({ game }) => {
				const state = game.progression.rites.state.run
				const difficulty = state.encounterHistory.length
				const bot = game.getBotPlayer()
				const botRows = game.board.getControlledRows(bot)
				Keywords.summonMultipleUnits({
					owner: bot,
					cardConstructor: UnitRitesTargetDummy,
					rowIndex: botRows[0].index,
					unitIndex: 2,
					count: difficulty,
				})
			})
			.startDialog(() => {
				const character = game.progression.rites.state.meta.character

				const getBlastType = (): string => {
					if (character.heritage === 'mundane') return 'a blast of strong wind'
					else if (character.heritage === 'arcane') return 'a ball of fire'
					else if (character.heritage === 'nature') return 'an attack with the help of a nearby tree'
					else return 'a magical attack'
				}

				return `
					Start:
						> You arrive at an old training area, filled with a bunch of old and barely-survived targets.
							> Most of them are covered in snow, but the one in the back seems to be preserved a lot better
							> than the others.
						> You also can't help but feel like you're being watched...

						@ Move closer to inspect the curious dummy
							--> CloserToDummy

						@ Take this opportunity to train your fighting techniques
							--> StartFightImmediately

						@ Leave and move on with your pilgrimage
							--> TryingToLeave

					CloserToDummy:
						> You make your way over to the dummy in the back. It's obvious that it's the source of the gaze you
						> feel on your skin. It does not have any eyes to watch you with, however, so it must be
						> enchanted in one way or the other.
						${
							character.body === 'humanoid'
								? '> It reminds you of the targets you often practiced with in the village. The enchantment is similar, but much, much older, it seems.'
								: ''
						}
						> You notice a leather hat lying in the snow beneath the target. It looks like it was made by a complete amateur, so you're not particularly
							> interested in taking it for yourself. Even you can make a better one.

						@ Speak to the dummy.
							> This feels quite stupid to you. Who in their right mind would speak to an inanimate object like that? However, in the world of
								> magic and enchantments, who knows what's going to happen.
							EnchantedDummy:
							> And a hello back to you, partner!
							Narrator:
							> You are surprised to hear the ghostly voice straight in your head. It sounds very happy and energetic, and quite friendly at that.
							EnchantedDummy:
							> It would be my pleasure to take your final exam today! Please assume your combat position, and we may begin!
							--> StartCombat

						@ Put the hat on the dummy.
							EnchantedDummy:
							> Thank you so much, partner!
							Narrator:
							> You almost jump when you hear the ghostly voice in your head as you put the hat back into its' place.
							EnchantedDummy:
							> This hat was a gift from my very first candidate, and I am glad to have it back!
							> Congratulations! You have passed the COMPASSION test. Your combat challenge will be adjusted accordingly.
							--> CompassionTestPassed
							> Now, let us begin your exam, partner!
							--> StartCombat

						@ Return back
							--> Start

					StartFightImmediately:
						> You launch ${getBlastType()} at the closest dummy who has no chance to stand against it. It seems you still know your spells.
						> However, you notice that your actions have not been approved by whoever it was watching you.
							> You hear an unhappy whispers somewhere in the wind, and then, a disembodied voice appears in your head.
						EnchantedDummy:
						> Congratulations! You have failed the PATIENCE test. Your combat exam begins immediately.
						--> StartCombat

					TryingToLeave:
						Narrator:
						> You make a few steps before you hear a ghostly voice in your head.
						EnchantedDummy:
						> Not so fast, partner! Your exam is waiting, and you are not allowed to leave until you pass!
						--> StartCombat

					StartCombat:
						Narrator:
						> Suddenly you see a magical barrier appear on the edge of the arena you find yourself in.
							> It seems that you have no choice but to pass that "exam" for whoever left the enchantment in place.
						@ [Start combat]
			`
			})
			.actionChapter('CompassionTestPassed', () => {
				game.board
					.getAllUnits()
					.filter((unit) => unit.card instanceof UnitRitesTargetDummy)
					.forEach((unit) =>
						game.animation.thread(() =>
							game.board.destroyUnit(unit, {
								reason: UnitDestructionReason.CARD_EFFECT,
								destroyer: game.board.getAllUnits().find((unit) => unit.card instanceof UnitRitesEnchantedDummy)?.card,
							})
						)
					)
			})

		this.createCallback(GameEventType.UNIT_DESTROYED)
			.require(({ triggeringCard }) => triggeringCard instanceof UnitRitesEnchantedDummy)
			.startDialog(
				() => `
				EnchantedDummy:
				> Congratulations, partner! You have passed your VIOLENCE exam. Please report to the village elder to continue your initiation into HUNTERS.
				Narrator:
				> You see the enchantment fading, and the dummy rapidly disintegrating into pure magical energy.
					> It seems that it only had enough charge for one last fight.
				@ "Of course it had to be me..."
				@ You feel a bit sad for it.
				@ You move on as soon as the magical barrier fades.
				Narrator:
				> You leave the training field behind and continue with your journey.
				--> Finish
			`
			)
			.actionChapter('Finish', () => game.systemFinish(game.getHumanGroup(), GameVictoryCondition.STORY_TRIGGER))
	}
}
