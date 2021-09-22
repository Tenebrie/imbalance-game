import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import StoryCharacter from '@shared/enums/StoryCharacter'
import BuffImmuneDummies from '@src/game/buffs/campaign/BuffImmuneDummies'
import UnitUndercityGambler from '@src/game/cards/09-neutral/common/UnitUndercityGambler'
import HeroCultistOfAreddon from '@src/game/cards/09-neutral/epic/HeroCultistOfAreddon'
import HeroAura from '@src/game/cards/09-neutral/legendary/HeroAura'
import HeroPozoga from '@src/game/cards/09-neutral/legendary/HeroPozoga'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import HeroChallengeLegendaryExplorer0 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer0'
import UnitChallengeEagerExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeEagerExplorer'
import UnitChallengeScarredExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeScarredExplorer'
import HeroNotEleyas from '@src/game/cards/10-challenge/nessadventure/HeroNotEleyas'
import HeroNotNessaHidden from '@src/game/cards/10-challenge/nessadventure/HeroNotNessaHidden'
import UnitCorgiGravedigger from '@src/game/cards/10-challenge/nessadventure/UnitCorgiGravedigger'
import UnitDryadSmuggler from '@src/game/cards/10-challenge/nessadventure/UnitDryadSmuggler'
import UnitEleyasDoppelganger from '@src/game/cards/10-challenge/nessadventure/UnitEleyasDoppelganger'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import { ServerGameNovelCreator } from '@src/game/models/ServerGameNovel'
import Keywords from '@src/utils/Keywords'

export default class RulesetNessadventure extends ServerRuleset {
	opCardsPlayed = 0
	pozogaPlayed = false
	extraPozogaPlayed = false
	nessaPlayed = false
	eleyasBuffed = false
	handReplenished = false
	handNotReplenishedAgain = false

	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: false,
				FIRST_GROUP_MOVES_FIRST: true,
			},
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: CustomDeckRules.STANDARD,
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderChallengeDummy, { card: UnitChallengeDummyOPWarrior, count: Constants.CARD_LIMIT_BRONZE }],
			})

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ group }) => group.isHuman)
			.perform(({ game }) =>
				game.novel.startDialog(`
					${StoryCharacter.UNKNOWN}:
					> Welcome, to State of Imbalance!'
					${StoryCharacter.NARRATOR}:
					> Our story today begins, as all things should, with a mulligan.
					> A mulligan that I might have been a tiny bit late to, granted, yet the mulligan is the one that starts every game.
					> That would mean, however, that our story, as all things should, begins right after the mulligan.
						> The poor Dummy is about to resist the player to the best of its' poor abilities.
					> I do not envy the chances of the poor creature, but let us see how it plays out.
					> Begin.
				`)
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isBot)
			.require(({ triggeringCard }) => triggeringCard instanceof UnitChallengeDummyOPWarrior)
			.perform(() => (this.opCardsPlayed += 1))

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isBot)
			.require(() => this.opCardsPlayed === 0)
			.perform(({ game }) =>
				game.novel.startDialog(`
					${StoryCharacter.NARRATOR}:
					> It seems that the dummy is opening with a stronger card this time.
					> How unfortunate. For the player, of course.
					> I wonder what the player will do in such a position.
				`)
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isBot)
			.require(() => this.opCardsPlayed === 2)
			.perform(({ game }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.UNKNOWN}:
						> Psst. Take these. Don't tell her you've seen me.
						${StoryCharacter.PROTAGONIST}:
						@ Who are you?
						@ Uhm... thanks?
						@ [Keep silent]
						--> Gift
					`
					)
					.closingChapter('Gift', onNessaGiftAccepted)
			)

		const onNessaGiftAccepted = (): void => {
			const player = game.getSinglePlayer()
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isBot)
			.require(() => this.opCardsPlayed === 6)
			.require(() => !this.pozogaPlayed)
			.perform(({ game }) =>
				game.novel.startDialog(`
					${StoryCharacter.NOT_NESSA}:
					> Hey, uhm, have you seen the cards I've given you?
					@ I have, why?
						${StoryCharacter.NOT_NESSA}:
						> Mind... playing them?
						@ Okay, I'll play one.
							${StoryCharacter.NOT_NESSA}:
							> Thank you! You won't regret it! ;)
					@ Why?
						${StoryCharacter.NOT_NESSA}:
						> Well...
						> (She scratches her head)
						> The script won't move forward if you don't.
						> And you will probably lose.
						> Not necessarily, no. You can break the game and stuff, but...
						> Well, just saying, you probably want to.
					})
					@ Don't want to, no
						${StoryCharacter.NOT_NESSA}:
						> Well...
						> (She scratches her head)
						> The script won't move forward if you don't.
						> And you will probably lose.
						> Not necessarily, no. You can break the game and stuff, but...
						> Well, just saying, you probably actually do want to.
						> That is, unless you've already seen the script and looking for easter eggs.
						> In that case, I guess, good luck?
					`)
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isHuman)
			.require(({ triggeringCard }) => triggeringCard instanceof HeroPozoga)
			.require(() => this.opCardsPlayed < 3)
			.require(() => !this.extraPozogaPlayed)
			.perform(() => (this.extraPozogaPlayed = true))
			.perform(({ game }) =>
				game.novel.startDialog(`
					${StoryCharacter.NARRATOR}:
					> Hm? Pozoga? How predictable.
					@ What else am I supposed to do?
						${StoryCharacter.NARRATOR}:
						> I mean, it doesn't change the inevitable, so whatever.
					@ Don't mind me, just looking for easter eggs.
						${StoryCharacter.NARRATOR}:
						> Understandable. Have a nice day.
					@ Well, it was in my deck by accident...
						${StoryCharacter.NARRATOR}:
						> Then you are just good at this game. Got it. Please keep going.
				`)
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isHuman)
			.require(({ triggeringCard }) => triggeringCard instanceof HeroPozoga)
			.require(() => this.opCardsPlayed >= 3)
			.require(() => !this.pozogaPlayed)
			.perform(() => (this.pozogaPlayed = true))
			.perform(({ game }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.NARRATOR}:
						> Oh no, ${
							this.extraPozogaPlayed ? '<b>another</b> ' : ''
						} Pozoga has been played! I suppose it would be a shame if the Dummy amps up their game!
						@ That's unfair!
							${StoryCharacter.NARRATOR}:
							> Just as unfair as you having ${
								game.getSinglePlayer().cardHand.unitCards.filter((card) => card instanceof HeroPozoga).length + 1
							} copies of Pozoga in your hand!
							> Here, I'll let you choose your poison today. Feeling generous, you know.
							@ [All enemy units are immune]
							@ [Enemy leader gets a selector to make all units immune]
							@ [Enemy dummies are untargetable and do not take damage]
							--> DummyLevelUp
					`
					)
					.closingChapter('DummyLevelUp', onDummyLevelUp)
			)

		const onDummyLevelUp = (): ServerGameNovelCreator => {
			game.getBotPlayer().leader.buffs.add(BuffImmuneDummies, null)
			return new ServerGameNovelCreator(game)
				.exec(
					`
				${StoryCharacter.UNKNOWN}:
				> That is just not very nice!'
				${StoryCharacter.UNKNOWN}:
				> Don't mind me, I'll just make myself comfortable right here.
				${StoryCharacter.NOT_NESSA}:
				> Name's... definitely not Nessa, by the way.
				@ [Continue] -> Continue
			`
				)
				.chapter('Continue', () => {
					const player = game.getSinglePlayer()
					player.cardHand.unitCards.forEach((card) => player.cardHand.discardCard(card))
					Keywords.addCardToHand.for(player).fromConstructor(HeroNotNessaHidden)
					return `
					${StoryCharacter.NOT_NESSA}:
					> Like, I am not implying that you need to do something specific here, but...'
					> You know, we both know you wanna do it, so go right ahead.'
				`
				})
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isHuman)
			.require(({ triggeringCard }) => triggeringCard instanceof HeroNotNessaHidden)
			.require(() => !this.nessaPlayed)
			.perform(() => (this.nessaPlayed = true))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.NOT_NESSA}:
						> Thank you! And I've brought some friends, hope you don't mind!
						--> Continue
						`
					)
					.closingChapter('Continue', () => {
						Keywords.addCardToHand.for(owner).fromConstructor(HeroNotEleyas)
						Keywords.addCardToHand.for(owner).fromConstructor(HeroAura)
						for (let i = 0; i < 2; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(HeroCultistOfAreddon)
						}
						for (let i = 0; i < 3; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitUndercityGambler)
						}
						for (let i = 0; i < 5; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitDryadSmuggler)
						}
						game.novel.startDialog(`
								${StoryCharacter.NOT_NESSA}:
								> Oh, and a small reminder. When a card is returned to the deck, it goes to the bottom. ;)
							`)
					})
			)

		this.createCallback(GameEventType.CARD_DRAWN)
			.require(({ owner }) => owner.isHuman)
			.require(({ triggeringCard }) => triggeringCard instanceof HeroNotEleyas)
			.require(() => !this.eleyasBuffed)
			.perform(() => (this.eleyasBuffed = true))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.NOT_NESSA}:
						> Hm. Just 2 Power at a time. I don't think that will cut it.
						> What about... some multiplication?
						@ [Continue] -> Continue
					`
					)
					.closingChapter('Continue', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitEleyasDoppelganger)
						}
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isHuman)
			.require(({ owner }) => owner.cardHand.unitCards.length === 0)
			.require(() => this.nessaPlayed)
			.require(() => !this.handReplenished)
			.perform(() => (this.handReplenished = true))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.NOT_NESSA}:
						> Out of cards? No worries. What else do I have left?
						> (Shuffling noises)
						> (More shuffling noises)
						> Found 'em!
						[Continue] -> Continue
						`
					)
					.closingChapter('Continue', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitCorgiGravedigger)
						}
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ owner }) => owner.isHuman)
			.require(({ owner }) => owner.cardHand.unitCards.length === 0)
			.require(() => this.handReplenished && !this.handNotReplenishedAgain)
			.perform(() => (this.handNotReplenishedAgain = true))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog(
						`
						${StoryCharacter.NOT_NESSA}:
						> Uhm, did you run out of cards on purpose?
						> I mean...
						> You can have some more, but I am out of stuff after this.
						> (Shuffling noises)
						> Which ones do you want?
						@ More corgis! -> Corgis
						@ More doppelgangers! -> Doppelgangers
						@ Surprise me! -> Surprise
						`
					)
					.closingChapter('Corgis', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitCorgiGravedigger)
						}
					})
					.closingChapter('Doppelgangers', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitEleyasDoppelganger)
						}
					})
					.continue('Surprise', () => {
						return new ServerGameNovelCreator(game)
							.exec(
								`
								${StoryCharacter.NOT_NESSA}:
								> Surprise you?
								> I guess I can grab some of the cards from another encounter...
								> Give me a minute.
								> ...
								> ...
								> ...
								> ...
								> ...
								> ...
								> Sorry. The other encounters are hard to get to, you know? The rulesets are kinda isolated from each other.
								> Aha! Found something.
								> Have fun with these.
								--> Continue
							`
							)
							.closingChapter('Continue', () => {
								Keywords.addCardToHand.for(owner).fromConstructor(HeroChallengeLegendaryExplorer0)
								for (let i = 0; i < 3; i++) {
									Keywords.addCardToHand.for(owner).fromConstructor(UnitChallengeScarredExplorer)
								}
								for (let i = 0; i < 6; i++) {
									Keywords.addCardToHand.for(owner).fromConstructor(UnitChallengeEagerExplorer)
								}
							})
					})
			)

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.require(() => this.nessaPlayed)
			.perform(({ game }) => {
				game.novel.startDialog(`
					${StoryCharacter.NARRATOR}:
					> And so ends the fierce battle...'
					${StoryCharacter.NOT_NESSA}:
					> Fierce? You just cheated! From the very beginning!
					> Dummies are not supposed to be 50-power cards, and they are definitely not supposed to be immune!
					${StoryCharacter.NARRATOR}:
					> Who are you supposed to be?
					${StoryCharacter.NOT_NESSA}:
					> Uhm... Me?
					> It's written right here. A bit up. No?
					${StoryCharacter.NARRATOR}:
					> "Not Nessa", sure. But if not Nessa, then who?
					${StoryCharacter.NOT_NESSA}:
					> I... I gotta go. Bye!'
					${StoryCharacter.NARRATOR}:
					> ...
					> And so ends the fierce battle of ${game.getSinglePlayer().player.username}, definitely-not-Nessa, and the Overcharged Target Dummy.
					> Hope you enjoyed this little adventure!
				`)

				if (game.getSinglePlayer().player.username.includes('Nenl') && new Date().getDate() === 31 && new Date().getMonth() === 4) {
					game.novel.startDialog(`
						Narrator:
						> ...
						> Oh, and one more thing.
						> Happy birthday! 🎂
						> :)
					`)
				}
			})

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanGroup())
			.require(() => !this.nessaPlayed)
			.perform(({ game }) => {
				game.novel
					.startDialog(
						`
					${StoryCharacter.NARRATOR}:
					> ...
					> Am confused.
					> ...
					> You have managed to win while skipping most of the script. Including the part where you get completely overpowered cards to counter the immune dummies.
					> Is my game that broken?
					> Granted, you have infinite tries, and you know exactly what the enemy will do, but still...
					> ...
					${StoryCharacter.NOT_NESSA}:
					> Hey, don't be sad, you mighty dragon!
					> You made this entire story, you wrote every single one of those words, coded basically every single thing that exists in this game.
					> So what if it's a bit broken? Wasn't that the point, that the State of Imbalance is a bit, you know, imbalanced?
					${StoryCharacter.NARRATOR}:
					> Fair point.
					${StoryCharacter.NOT_NESSA}:
					> See? So you want me to give you a hug?
					${StoryCharacter.NARRATOR}:
					> ...
					${StoryCharacter.NOT_NESSA}:
					> I'll take it as a yes.
					> And you, player. What do you think about this whole adventure? Nessadventure, as a certain someone would call it.
					@ It was amazing! I'll give it a ten! -> feedbackGreat
					@ I'll give it a... three. -> feedbackMeh
					@ A broken pile of steaming garbage. -> feedbackBad
					`
					)
					.chapter(
						'feedbackGreat',
						() => `
						${StoryCharacter.NARRATOR}:
						> You're just saying that to make me feel better, don't you?
						${StoryCharacter.NOT_NESSA}:
						> No, they're saying that because the adventure was great!
						> Can't you just be happy with what you have done for once?
						${StoryCharacter.NARRATOR}:
						> Nope.
						${StoryCharacter.NOT_NESSA}:
						> It seems more hugs are in order.
						> Thank you for playing, player. We are both glad you enjoyed it, and we wish to see you again soon!
					`
					)
					.chapter(
						'feedbackMeh',
						() => `
						${StoryCharacter.NARRATOR}:
						> Well, considering that it went idea to implementation in a day...
						> I guess that is a fair assessment.
						${StoryCharacter.NOT_NESSA}:
						> Shush, both! It was great, and you can't claim otherwise!
						> And you, player, get out and think about your attitude.
						> Break the game again or read the source code to see the other endings, I don't care.
					`
					)
					.chapter(
						'feedbackBad',
						() => `
						${StoryCharacter.NARRATOR}:
						> ...
						${StoryCharacter.NOT_NESSA}:
						> ...
						> Get. Out.
					`
					)
			})

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanGroup())
			.perform(({ game }) => {
				game.novel.startDialog(`
					${StoryCharacter.NARRATOR}:
					> Uhm...
					> I am sorry. That was not my intention.
					> ...
					> This was supposed a very easy little joke scenario. Not sure what went wrong.
					> ...
					> Do you mind trying again? Just... go with the script, okay?
					> Or not. Your choice. Not like I can force you.
					> ...
					> ...
					> ...
					> See you in a bit? I hope.
				`)
			})
	}
}
