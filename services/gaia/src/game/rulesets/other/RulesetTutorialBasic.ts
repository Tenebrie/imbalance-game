import AIBehaviour from '@shared/enums/AIBehaviour'
import CardType from '@shared/enums/CardType'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import UnitStrayDog from '@src/game/cards/09-neutral/tokens/UnitStrayDog'
import UnitChallengeDummyVanillaWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'
import TutorialHeroTroviar from '@src/game/cards/13-special/cards/TutorialHeroTroviar'
import TutorialSpellFleetingSpark from '@src/game/cards/13-special/cards/TutorialSpellFleetingSpark'
import TutorialSpellScrollOfGrowth from '@src/game/cards/13-special/cards/TutorialSpellScrollOfGrowth'
import TutorialSpellShadowSpark from '@src/game/cards/13-special/cards/TutorialSpellShadowSpark'
import TutorialSpellSteelSpark from '@src/game/cards/13-special/cards/TutorialSpellSteelSpark'
import TutorialUnitEagleEyeArcher from '@src/game/cards/13-special/cards/TutorialUnitEagleEyeArcher'
import TutorialUnitPriestessOfAedine from '@src/game/cards/13-special/cards/TutorialUnitPriestessOfAedine'
import TutorialUnitSparklingSpirit from '@src/game/cards/13-special/cards/TutorialUnitSparklingSpirit'
import TutorialUnitStormElemental from '@src/game/cards/13-special/cards/TutorialUnitStormElemental'
import TutorialUnitWoundedVeteran from '@src/game/cards/13-special/cards/TutorialUnitWoundedVeteran'
import LeaderTutorialOpponent from '@src/game/cards/13-special/leaders/LeaderTutorialOpponent'
import LeaderTutorialPlaceholder from '@src/game/cards/13-special/leaders/LeaderTutorialPlaceholder'
import GameHookType from '@src/game/models/events/GameHookType'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class RulesetTutorialBasic extends ServerRuleset {
	finalDialogShown = false

	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.OTHER,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				ROUND_WINS_REQUIRED: 3,
			},
			hiddenFromMenu: true,
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderTutorialPlaceholder, { card: TutorialUnitWoundedVeteran, count: 1 }],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderTutorialOpponent, { card: UnitChallengeDummyVanillaWarrior, count: 1 }],
			})

		/* Happy path script */
		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				Narrator:
				> Welcome to State of Imbalance Alpha!
					> This tutorial scenario will explain the basic concepts about the game.
					> Click or press "Space" to continue...
				> Actually, "Space" key doesn't work at the moment, I know. Will fix soon.
				> Your goal during a round is to score more points than your opponent.
					> The score - displayed in a bubble on the right side of the board - is the total power of your cards on the board.
					> Cards on the board are generally called Units.
				> You have one unit in your hand, Wounded Veteran.
					> Try dragging it onto the board.
			`
			)

		this.createCallback(GameEventType.TURN_STARTED)
			.require(() => game.roundIndex === 0 && game.turnIndex === 1)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				Narrator:
				> Unless specified otherwise, you need to play exactly one unit from your hand on your turn.
					> After you played Wounded Veteran, the opponent took their turn as well.
				> You may have noticed that your card did something when it was played.
					> Deploy effects happen as soon as the card is, well, deployed on the board.
					> This card deals damage to itself when played. Seems weird, I know.
				> I'll add another card to your hand. Try healing the veteran up?
				--> AddHealer
			`
			)
			.closingChapter('AddHealer', () => {
				Keywords.addCardToHand.for(game.getHumanGroup().players[0]).fromConstructor(TutorialUnitPriestessOfAedine)
			})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(() => game.roundIndex === 0 && game.turnIndex === 2)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				Narrator:
				> I forgot to mention that the game is played over multiple rounds.
					> Normally it is a Best-of-3 match, but this one is, in fact, Best-of-5.
				> Your opponent has decided to forfeit this round as they don't have any more cards to play.
					> That is your only option if you are out of unit cards.
				> You're winning the round, so you are safe to claim your win.
					> The button is over there on the right.
			`
			)

		this.createCallback(GameEventType.TURN_STARTED)
			.require(() => game.roundIndex === 1 && game.turnIndex === 0)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				Narrator:
				> I don't want to hold your hand too much, so what about a little hands-on practice?
				> I'll give you a few cards, and you beat this pesky AI. Deal?
				@ Deal.
					Narrator:
					> I knew I can count on you.
					> If you need to figure out what a card is, just right-click it.
						> You'll see an overlay with the card description, any other related cards and other information.
					--> DropCards
				@ I need some instructions.
					Narrator:
					> Sure thing!
						> First, let me drop you some cards...
					--> DropCards
					Narrator: 
					> Currently you have two types of cards in your hand: 
						> - One Troviar, the Torturer.
						> - And a few Eagle Eye Archers.
					> Troviar's effect triggers when some unit takes damage, and the archers deal damage to an enemy!
					> You'll want to play Troviar first, and then shoot at whatever the enemy has on the board.
					> After you're done, just end the round like last time.
					> Also, if you ever need to figure out what a card is, just right-click it.
						> You'll see an overlay with the card description, any other related cards and other information.
			`
			)
			.closingChapter('DropCards', () => {
				Keywords.addCardToHand.for(game.getSinglePlayer()).fromConstructor(TutorialHeroTroviar)
				Keywords.addCardToHand.for(game.getSinglePlayer()).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.addCardToHand.for(game.getSinglePlayer()).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.addCardToHand.for(game.getSinglePlayer()).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.addCardToHand.for(game.getBotPlayer()).fromConstructor(TutorialUnitWoundedVeteran)
				Keywords.addCardToHand.for(game.getBotPlayer()).fromConstructor(TutorialUnitPriestessOfAedine)
				Keywords.addCardToHand.for(game.getBotPlayer()).fromConstructor(TutorialUnitPriestessOfAedine)
				Keywords.addCardToHand.for(game.getBotPlayer()).fromConstructor(TutorialUnitPriestessOfAedine)
			})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(({ group }) => group.isHuman)
			.perform(() => {
				game.getSinglePlayer().addSpellMana(5, null)
			})
			.startDialog(
				`
				Narrator:
				> Good job!
				> Now, let me introduce something... magic!
					> Quite literally, in fact.
				> In a normal game, you will have a few leader powers available to you.
					> Those are spells you can cast during your turn, before playing a unit.
				> They also require mana to be played. You can see your current mana on the right, next to the "End round" button. 
				> I've given you some mana right now. Usually it's replenished at the start of every round.
					> The amount of mana you have depends on your chosen leader.
				> Now, shall we try casting some spells?
					> Cast all your spells before playing the unit.
				--> Setup
			`
			)
			.closingChapter('Setup', () => {
				const player = game.getSinglePlayer()
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
				player.cardHand.addSpell(new TutorialSpellShadowSpark(game))
				player.cardHand.addSpell(new TutorialSpellFleetingSpark(game))
				player.cardHand.addSpell(new TutorialSpellScrollOfGrowth(game))

				Keywords.summonUnit({
					owner: player,
					rowIndex: game.board.getRowWithDistanceToFront(player, 0).index,
					unitIndex: 0,
					cardConstructor: TutorialUnitWoundedVeteran,
				})

				const bot = game.getBotPlayer()
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.summonUnit({
					owner: bot,
					rowIndex: game.board.getRowWithDistanceToFront(bot, 0).index,
					unitIndex: 0,
					cardConstructor: TutorialUnitWoundedVeteran,
				})
			})

		this.createCallback(GameEventType.TURN_STARTED)
			.require(() => game.roundIndex === 2 && game.turnIndex === 1)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				Narrator:
				> Did you notice how the spell labeled as Leader Power returned to your hand?
				> Leader powers can be used every turn, as long as you have the mana to afford them.
					> Other spells, however, are single-use only.
				> Want to practice some more spell-slinging before we wrap up?
				@ Yes, why not.
					Narrator:
					> Glad to hear it.
					> I'll toss a few more cards at you, but I think you can figure it out.
					--> Spellsling
				@ No, I get it.
					Narrator:
					> Alright. Then feel free to just end the round right now.
			`
			)
			.closingChapter('Spellsling', () => {
				const player = game.getSinglePlayer()
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitSparklingSpirit)
				Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitSparklingSpirit)
				player.cardHand.addSpell(new TutorialSpellSteelSpark(game))
				player.cardHand.addSpell(new TutorialSpellFleetingSpark(game))
				player.cardHand.addSpell(new TutorialSpellScrollOfGrowth(game))

				const bot = game.getBotPlayer()
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitEagleEyeArcher)
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitWoundedVeteran)
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
				Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
			})

		this.createHook(GameHookType.GAME_FINISHED)
			.require(() => !this.finalDialogShown)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(({ victoryReason }) => {
				game.novel
					.startDialog(
						`
					Narrator:
					> Thanks for playing the tutorial!
					> I don't want to keep you too long, so I'll call it here.
						> Feel free to explore the menus and play versus AI to practice more.
					> Hope you enjoy your time in State of Imbalance.
					--> Finish
					`
					)
					.closingChapter('Finish', () => {
						this.finalDialogShown = true
						game.finish(game.getHumanGroup(), victoryReason)
					})
			})

		/* Disobedience triggers */
		let firstDisobedienceTriggered = false
		let firstDisobedienceTriggeredTwice = false
		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 0 && game.turnIndex <= 1)
			.require(() => !firstDisobedienceTriggered)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				firstDisobedienceTriggered = true
				game.novel.startDialog(`
					Narrator:
					> Hey, uhm, so about this button.
					> I'll explain what it does later. For now, may I ask you to play along and play the card from your hand?
					> Just drag it out to one of the blue rows in the middle of the screen.
				`)
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 0 && game.turnIndex <= 1)
			.require(() => firstDisobedienceTriggered && !firstDisobedienceTriggeredTwice)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				firstDisobedienceTriggeredTwice = true
				game.novel.startDialog(`
					Narrator:
					> ...
					> Look, it's a curated tutorial experience.
					> If you're very bored and you don't need your hand held, you're free to press Escape and leave.
					> Otherwise I have to ask you to follow the script.
				`)
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 0 && game.turnIndex <= 1)
			.require(() => firstDisobedienceTriggered && firstDisobedienceTriggeredTwice)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> Alright, let me help you out with that, if you're want to get it over with so fast.
						--> End
					`
					)
					.closingChapter('End', () => {
						this.finalDialogShown = true
						game.finish(game.getBotPlayer().group, 'Story trigger')
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 1)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length > 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> While you can end the round at any point normally, your opponent may keep playing their cards even after you do.
						> So, for the purposes of this tutorial scenario I'll kindly ask you to play all your cards before ending the round.
						--> Condition
					`
					)
					.continue('Condition', (novel) => {
						if (secondDisobedienceTriggered) {
							novel.exec(`
								Narrator:
								> ...
								> "All of them?", you might ask.
									> Yes, ALL of them.
								`)
						}
						return novel
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => game.getSinglePlayer().cardHand.spellCards.length > 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel.startDialog(
					`
						Narrator:
						> Would you please just play your spells? Thanks.
					`
				)
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => game.getSinglePlayer().cardHand.spellCards.length === 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel.startDialog(
					`
						Narrator:
						> So, you're out of spells. Now you need to play your unit card.
					`
				)
			})

		let agreedToHelp = false
		let thirdDisobedienceTriggered = false
		this.createHook(GameHookType.CARD_PLAYED)
			.require(({ card }) => card.type === CardType.UNIT)
			.require(({ owner }) => owner.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => !agreedToHelp && !thirdDisobedienceTriggered)
			.require(({ owner }) => owner.cardHand.spellCards.length > 0)
			.replace((values) => ({
				...values,
				playPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> I believe you already know how the units work, and this part of the tutorial covers spells.
						> May I kindly ask you to shoot all your spells away before playing the unit?
						@ Yes, of course.
							Narrator:
							> Thanks, that means a lot.
							--> Agreement
						@ No, absolutely not.
							Narrator:
							> Interesting.
							> The thing is, however, I may prevent you from doing anything other than using spells.
							> So we find ourself in a bit of a standstill.
							--> Denial
					`
					)
					.closingChapter('Agreement', () => (agreedToHelp = true))
					.closingChapter('Denial', () => (thirdDisobedienceTriggered = true))
			})

		this.createHook(GameHookType.CARD_PLAYED)
			.require(({ card }) => card.type === CardType.UNIT)
			.require(({ owner }) => owner.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => agreedToHelp)
			.require(({ owner }) => owner.cardHand.spellCards.length > 0)
			.replace((values) => ({
				...values,
				playPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> Didn't you just say you'll play along and play your spells?
						> Please, just... just play them, okay?
						> Otherwise... we find ourself in a bit of a standstill.
						--> Denial
					`
					)
					.closingChapter('Denial', () => {
						agreedToHelp = false
						thirdDisobedienceTriggered = true
					})
			})

		this.createHook(GameHookType.CARD_PLAYED)
			.require(({ card }) => card.type === CardType.UNIT)
			.require(({ owner }) => owner.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => thirdDisobedienceTriggered && (!firstDisobedienceTriggeredTwice || !secondDisobedienceTriggered))
			.require(({ owner }) => owner.cardHand.spellCards.length > 0)
			.replace((values) => ({
				...values,
				playPrevented: true,
			}))

		this.createHook(GameHookType.CARD_PLAYED)
			.require(({ card }) => card.type === CardType.UNIT)
			.require(({ owner }) => owner.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex === 0)
			.require(() => firstDisobedienceTriggeredTwice && secondDisobedienceTriggered && thirdDisobedienceTriggered)
			.require(({ owner }) => owner.cardHand.spellCards.length > 0)
			.replace((values) => ({
				...values,
				playPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> Okay.
						> Okay...
						> Congratulations.
						> You found the True Ending, or something. I don't even know.
						> Look, it's just a tutorial. Why do you need to be like this?
							> Be honest, at least.
						@ I have found it accidentally.
							Narrator:
							> Honestly? I don't believe it.
							> To trigger this conversation you needed to fail the tutorial in three different ways, multiple times.
							> 
						@ I was just testing all combinations.
							Narrator:
							> If this is true, you're a great QA engineer.
						@ I was looking for the easter eggs.
							Narrator:
							> Good job then, you found the ultimate easter egg.
							> Granted, I have no idea why it's even here.
								> Can't I just design a normal tutorial like any other game?
							> Apparently not.
						
						Narrator:
						> Anyway.
						> You've derailed the experience enough. You definitely know how the game works anyway, so why bother pretending?
						> I'll close the game after this. However. Want to ask me something before we wrap up?
						@ Why design all the extra conversations?
							Narrator:
							> Honestly? No idea. I guess this is just how I am.
							> I absolutely could just block all the incorrect actions, and leave it at that.
							> The tutorial would work, and it would serve the purpose absolutely fine.
							> But would it be a story? Would it be fun? I don't know. Don't think so.
							> I suppose, I just like telling stories. And this is the best medium I have access to.
							> ...
							> I hope to see you for more stories later, by the way. I have more where it came from.
							> But for now, thanks for playing. And have a good one.
						@ How long did it take to make this?
							Narrator:
							> The whole game, or just the tutorial?
							@ The whole game
								Narrator:
								> A while.
								> It's going to be two years soon, as I write this.
							@ The tutorial
								Narrator:
								> Not that long, actually.
								> Not counting all the supporting systems, the actual scenario took a couple of days.
							Narrator:
							> Hope you're satisfied with the answer. In any case, that's it from me.
							> Have a good one.
						@ No, nothing
							Narrator:
							> Alright.
							> Have a good one.
						--> Close
					`
					)
					.closingChapter('Close', () => {
						this.finalDialogShown = true
						game.finish(game.getHumanGroup(), 'Story trigger')
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex > 0)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length > 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel.startDialog(
					`
						Narrator:
						> You still have cards in your hand. You may want to play them all before ending the round.
					`
				)
			})

		/* Failure triggers */
		let secondRoundFailureCounter = 0
		let secondDisobedienceTriggered = false
		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 1)
			.require(() => secondRoundFailureCounter === 0)
			.require(
				() => game.board.getTotalPlayerPower(game.getSinglePlayer().group) <= game.board.getTotalPlayerPower(game.getBotPlayer().group)
			)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length === 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				secondRoundFailureCounter += 1
				game.novel
					.startDialog(
						`
						Narrator:
						> Hm. It seems that the opponent is winning at the moment.
						> You may need to play your cards in a different order.
						> Let me reset the round for you real quick.
						--> Reset
					`
					)
					.closingChapter('Reset', () => {
						game.board.getAllUnits().forEach((unit) => {
							game.animation.thread(() => {
								game.board.destroyUnit(unit)
							})
						})
						const player = game.getSinglePlayer()
						player.cardHand.unitCards.every((card) => player.cardHand.discardCard(card))
						Keywords.addCardToHand.for(player).fromConstructor(TutorialHeroTroviar)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)

						const bot = game.getBotPlayer()
						bot.cardHand.unitCards.every((card) => bot.cardHand.discardCard(card))
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitWoundedVeteran)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 1)
			.require(() => secondRoundFailureCounter === 1)
			.require(
				() => game.board.getTotalPlayerPower(game.getSinglePlayer().group) <= game.board.getTotalPlayerPower(game.getBotPlayer().group)
			)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length === 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				secondRoundFailureCounter += 1
				game.novel
					.startDialog(
						`
						Narrator:
						> They're still winning.
						> No worries. Here, have an extra card this time.
							> On the house.
						--> Reset
					`
					)
					.closingChapter('Reset', () => {
						game.board.getAllUnits().forEach((unit) => {
							game.animation.thread(() => {
								game.board.destroyUnit(unit)
							})
						})
						const player = game.getSinglePlayer()
						player.cardHand.unitCards.every((card) => player.cardHand.discardCard(card))
						Keywords.addCardToHand.for(player).fromConstructor(TutorialHeroTroviar)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)

						const bot = game.getBotPlayer()
						bot.cardHand.unitCards.every((card) => bot.cardHand.discardCard(card))
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitWoundedVeteran)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(UnitStrayDog)
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 1)
			.require(() => secondRoundFailureCounter === 2)
			.require(
				() => game.board.getTotalPlayerPower(game.getSinglePlayer().group) <= game.board.getTotalPlayerPower(game.getBotPlayer().group)
			)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length === 0)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				secondRoundFailureCounter += 1
				secondDisobedienceTriggered = true
				game.novel
					.startDialog(
						`
						Narrator:
						> Alright, you're doing it on purpose now.
						> Good luck failing this.
						--> Reset
					`
					)
					.closingChapter('Reset', () => {
						game.board.getAllUnits().forEach((unit) => {
							game.animation.thread(() => {
								game.board.destroyUnit(unit)
							})
						})
						const player = game.getSinglePlayer()
						player.cardHand.unitCards.every((card) => player.cardHand.discardCard(card))
						Keywords.addCardToHand.for(player).fromConstructor(TutorialHeroTroviar)
						for (let i = 0; i < 19; i++) {
							Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitEagleEyeArcher)
						}

						const bot = game.getBotPlayer()
						bot.cardHand.unitCards.every((card) => bot.cardHand.discardCard(card))
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitWoundedVeteran)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
					})
			})

		this.createHook(GameHookType.ROUND_FINISHED)
			.require(({ group }) => group.isHuman)
			.require(() => game.roundIndex === 2 && game.turnIndex > 0)
			.require(() => game.getSinglePlayer().cardHand.unitCards.length === 0)
			.require(
				() => game.board.getTotalPlayerPower(game.getSinglePlayer().group) <= game.board.getTotalPlayerPower(game.getBotPlayer().group)
			)
			.replace((values) => ({
				...values,
				finishPrevented: true,
			}))
			.perform(() => {
				game.novel
					.startDialog(
						`
						Narrator:
						> Losing here is practically impossible if you just play your stuff, so you're probably doing it on purpose.
						> Just go again.
						--> Reset
					`
					)
					.closingChapter('Reset', () => {
						game.board.getAllUnits().forEach((unit) => {
							game.animation.thread(() => {
								game.board.destroyUnit(unit)
							})
						})
						const player = game.getSinglePlayer()
						player.cardHand.unitCards.every((card) => player.cardHand.removeCard(card))
						player.cardHand.spellCards.every((card) => player.cardHand.removeCard(card))
						player.cardDeck.unitCards.forEach((card) => player.cardDeck.removeCard(card))
						player.cardDeck.spellCards.forEach((card) => player.cardDeck.removeCard(card))
						player.setSpellMana(5, null)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitStormElemental)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitSparklingSpirit)
						Keywords.addCardToHand.for(player).fromConstructor(TutorialUnitSparklingSpirit)
						player.cardHand.addSpell(new TutorialSpellSteelSpark(game))
						player.cardHand.addSpell(new TutorialSpellFleetingSpark(game))
						player.cardHand.addSpell(new TutorialSpellScrollOfGrowth(game))

						const bot = game.getBotPlayer()
						bot.cardHand.unitCards.every((card) => bot.cardHand.removeCard(card))
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitEagleEyeArcher)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitWoundedVeteran)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
						Keywords.addCardToHand.for(bot).fromConstructor(TutorialUnitPriestessOfAedine)
					})
			})
	}
}
