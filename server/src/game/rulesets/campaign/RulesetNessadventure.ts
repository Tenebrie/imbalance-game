import Constants from '@src/../../shared/src/Constants'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import GameMode from '@src/../../shared/src/enums/GameMode'
import LeaderChallengeDummy from '@src/game/cards/10-challenge/ai-00-dummy/LeaderChallengeDummy'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRulesetBuilder'
import StoryCharacter from '@shared/enums/StoryCharacter'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import Keywords from '@src/utils/Keywords'
import ServerGame from '@src/game/models/ServerGame'
import HeroPozoga from '@src/game/cards/09-neutral/legendary/HeroPozoga'
import BuffImmuneDummies from '@src/game/buffs/campaign/BuffImmuneDummies'
import HeroNotNessaHidden from '@src/game/cards/10-challenge/nessadventure/HeroNotNessaHidden'
import UnitUndercityGambler from '@src/game/cards/09-neutral/common/UnitUndercityGambler'
import HeroCultistOfAreddon from '@src/game/cards/09-neutral/epic/HeroCultistOfAreddon'
import HeroAura from '@src/game/cards/09-neutral/legendary/HeroAura'
import HeroNotEleyas from '@src/game/cards/10-challenge/nessadventure/HeroNotEleyas'
import UnitDryadSmuggler from '@src/game/cards/10-challenge/nessadventure/UnitDryadSmuggler'
import UnitEleyasDoppelganger from '@src/game/cards/10-challenge/nessadventure/UnitEleyasDoppelganger'
import UnitChallengeEagerExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeEagerExplorer'
import UnitChallengeScarredExplorer from '@src/game/cards/10-challenge/challenge-discovery/UnitChallengeScarredExplorer'
import HeroChallengeLegendaryExplorer0 from '@src/game/cards/10-challenge/challenge-discovery/HeroChallengeLegendaryExplorer0'
import UnitCorgiGravedigger from '@src/game/cards/10-challenge/nessadventure/UnitCorgiGravedigger'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'

type State = {
	opCardsPlayed: number
	pozogaPlayed: boolean
	extraPozogaPlayed: boolean
	nessaPlayed: boolean
	eleyasBuffed: boolean
	handReplenished: boolean
	handNotReplenishedAgain: boolean
}

export default class RulesetNessadventure extends ServerRulesetBuilder<State> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			state: {
				opCardsPlayed: 0,
				pozogaPlayed: false,
				extraPozogaPlayed: false,
				nessaPlayed: false,
				eleyasBuffed: false,
				handReplenished: false,
				handNotReplenishedAgain: false,
			},
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
		})

		this.createAI([LeaderChallengeDummy, { card: UnitChallengeDummyOPWarrior, count: Constants.CARD_LIMIT_BRONZE }])

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ game, player }) => player === game.getHumanPlayer())
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.UNKNOWN)
					.say('Welcome, to State of Imbalance!')
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Our story today begins, as all things should, with a mulligan.')
					.say('...')
					.say('A mulligan that I might have been a tiny bit late to, granted, yet the mulligan is the one that starts every game.')
					.say(
						'That would mean, however, that our story, as all things should, begins <b>right after</b> the mulligan.' +
							"The poor Dummy is about to resist the player to the best of its' poor abilities."
					)
					.say('I do not envy the chances of the poor creature, but let us see how it plays out.')
					.say('Begin.')
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getBotPlayer())
			.require(({ triggeringCard }) => triggeringCard instanceof UnitChallengeDummyOPWarrior)
			.perform(({ game }) => this.setState(game, { opCardsPlayed: this.getState(game).opCardsPlayed + 1 }))

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getBotPlayer())
			.require(({ game }) => this.getState(game).opCardsPlayed === 0)
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('It seems that the dummy is opening with a stronger card this time.')
					.say('How unfortunate. For the player, of course.')
					.say('I wonder what the player will do in such a position.')
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getBotPlayer())
			.require(({ game }) => this.getState(game).opCardsPlayed === 2)
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.UNKNOWN)
					.say("Psst. Take these. Don't tell her you've seen me.")
					.reply('Who are you?', () => onNessaGiftAccepted(game))
					.reply('Uhm... thanks?', () => onNessaGiftAccepted(game))
					.reply('[Keep silent]', () => onNessaGiftAccepted(game))
			)

		const onNessaGiftAccepted = (game: ServerGame): void => {
			const player = game.getHumanPlayer()!
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
			Keywords.addCardToHand.for(player).fromConstructor(HeroPozoga)
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getBotPlayer())
			.require(({ game }) => this.getState(game).opCardsPlayed === 6)
			.require(({ game }) => this.getState(game).pozogaPlayed === false)
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say("Hey, uhm, have you seen the cards I've given you?")
					.reply('I have, why?', () => {
						game.novel
							.startDialog()
							.setCharacter(StoryCharacter.NOT_NESSA)
							.say('Mind... playing them?')
							.reply("Okay, I'll play one.", () => {
								game.novel.startDialog().setCharacter(StoryCharacter.NOT_NESSA).say('Thank you! You won\t regret it!')
							})
							.reply('Why?', () => {
								game.novel
									.startDialog()
									.setCharacter(StoryCharacter.NOT_NESSA)
									.say('Well...')
									.say('(Scratches her head)')
									.say("The script won't move forward if you don't.")
									.say('And you will probably lose.')
									.say('Not necessarily, no. You can break the game and stuff, but...')
									.say('Well, just saying, you probably want to.')
							})
							.reply("Don't want to, no", () => {
								game.novel
									.startDialog()
									.setCharacter(StoryCharacter.NOT_NESSA)
									.say('Well...')
									.say('(Scratches her head)')
									.say("The script won't move forward if you don't.")
									.say('And you will probably lose.')
									.say('Not necessarily, no. You can break the game and stuff, but...')
									.say('Well, just saying, you probably actually <b>do</b> want to.')
									.say("That is, unless you've already seen the script and looking for easter eggs.")
									.say('In that case, I guess, good luck?')
							})
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ triggeringCard }) => triggeringCard instanceof HeroPozoga)
			.require(({ game }) => this.getState(game).opCardsPlayed < 3)
			.require(({ game }) => this.getState(game).extraPozogaPlayed === false)
			.perform(({ game }) => this.setState(game, { extraPozogaPlayed: true }))
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Hm? Pozoga? How predictable.')
					.reply('What else am I supposed to do?', () => {
						game.novel.startDialog().setCharacter(StoryCharacter.NARRATOR).say("I mean, it doesn't change the inevitable, so whatever.")
					})
					.reply("Don't mind me, just looking for easter eggs.", () => {
						game.novel.startDialog().setCharacter(StoryCharacter.NARRATOR).say('Understandable. Have a nice day.')
					})
					.reply('Well, it was in my deck by accident...', () => {
						game.novel
							.startDialog()
							.setCharacter(StoryCharacter.NARRATOR)
							.say('Then you are just good at this game. Got it. Please keep going.')
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ triggeringCard }) => triggeringCard instanceof HeroPozoga)
			.require(({ game }) => this.getState(game).opCardsPlayed >= 3)
			.require(({ game }) => this.getState(game).pozogaPlayed === false)
			.perform(({ game }) => this.setState(game, { pozogaPlayed: true }))
			.perform(({ game }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say(
						`Oh no, ${
							this.getState(game).extraPozogaPlayed ? '<b>another</b> ' : ''
						} Pozoga has been played! I suppose it would be a shame if the Dummy amps up their game!`
					)
					.reply("That's unfair!", () => {
						game.novel
							.startDialog()
							.setCharacter(StoryCharacter.NARRATOR)
							.say(
								`Just as unfair as you having ${
									game.getHumanPlayer()!.cardHand.unitCards.filter((card) => card instanceof HeroPozoga).length + 1
								} copies of Pozoga in your hand!`
							)
							.say("Here, I'll let you choose your poison today. Feeling generous, you know.")
							.reply('[All enemy units are immune]', () => onDummyLevelUp(game))
							.reply('[Enemy leader gets a selector to make all units immune]', () => onDummyLevelUp(game))
							.reply('[Enemy dummies are untargetable and do not take damage]', () => onDummyLevelUp(game))
					})
			)

		const onDummyLevelUp = (game: ServerGame): void => {
			game.getBotPlayer()!.leader.buffs.add(BuffImmuneDummies, null)
			game.novel
				.startDialog()
				.setCharacter(StoryCharacter.UNKNOWN)
				.say('That is just not very nice!')
				.setCharacter(StoryCharacter.UNKNOWN)
				.say("Don't mind me, I'll just make myself comfortable right here.")
				.setCharacter(StoryCharacter.NOT_NESSA)
				.say("Name's... definitely not Nessa, by the way.")
				.reply('[Continue]', () => {
					const player = game.getHumanPlayer()!
					player.cardHand.unitCards.forEach((card) => player.cardHand.discardCard(card))
					Keywords.addCardToHand.for(player).fromConstructor(HeroNotNessaHidden)
					game.novel
						.startDialog()
						.setCharacter(StoryCharacter.NOT_NESSA)
						.say('Like, I am not implying that you need to do something specific here, but...')
						.say('You know, we both know you wanna do it, so go right ahead.')
				})
		}

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ triggeringCard }) => triggeringCard instanceof HeroNotNessaHidden)
			.require(({ game }) => this.getState(game).nessaPlayed === false)
			.perform(({ game }) => this.setState(game, { nessaPlayed: true }))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say("Thank you! And I've brought some friends, hope you don't mind!")
					.reply('[Continue]', () => {
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
						game.novel
							.startDialog()
							.setCharacter(StoryCharacter.NOT_NESSA)
							.say('Oh, and a small reminder. When a card is returned to the deck, it goes to the <b>bottom</b>. ;)')
					})
			)

		this.createCallback(GameEventType.CARD_DRAWN)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ triggeringCard }) => triggeringCard instanceof HeroNotEleyas)
			.require(({ game }) => this.getState(game).eleyasBuffed === false)
			.perform(({ game }) => this.setState(game, { eleyasBuffed: true }))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say("Hm. Just 2 Power at a time. I don't think that will cut it.")
					.say('What about... some multiplication?')
					.reply('[Continue]', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitEleyasDoppelganger)
						}
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ owner }) => owner.cardHand.unitCards.length === 0)
			.require(({ game }) => this.getState(game).nessaPlayed === true)
			.require(({ game }) => this.getState(game).handReplenished === false)
			.perform(({ game }) => this.setState(game, { handReplenished: true }))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('Out of cards? No worries. What else do I have left?')
					.say('(Shuffling noises)')
					.say('(More shuffling noises)')
					.say("Found 'em!")
					.reply('[Continue]', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitCorgiGravedigger)
						}
					})
			)

		this.createCallback(GameEventType.CARD_PLAYED)
			.require(({ game, owner }) => owner === game.getHumanPlayer())
			.require(({ owner }) => owner.cardHand.unitCards.length === 0)
			.require(({ game }) => this.getState(game).handReplenished === true && this.getState(game).handNotReplenishedAgain === false)
			.perform(({ game }) => this.setState(game, { handNotReplenishedAgain: true }))
			.perform(({ game, owner }) =>
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('Uhm, did you run out of cards on purpose?')
					.say('I mean...')
					.say('You can have some more, but I am out of stuff after this.')
					.say('(Shuffling noises)')
					.say('Which ones do you want?')
					.reply('More corgis!', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitCorgiGravedigger)
						}
					})
					.reply('More doppelgangers!', () => {
						for (let i = 0; i < 10; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitEleyasDoppelganger)
						}
					})
					.reply('Surprise me!', () => {
						game.novel
							.startDialog()
							.setCharacter(StoryCharacter.NOT_NESSA)
							.say('Surprise you?')
							.say('I guess I can grab some of the cards from another encounter...')
							.say('Give me a minute.')
							.say('...')
							.say('...')
							.say('...')
							.say('...')
							.say('...')
							.say('...')
							.say('Sorry. The other encounters are hard to get to, you know? The rulesets are kinda isolated from each other.')
							.say('Anyway, have fun with these.')
						Keywords.addCardToHand.for(owner).fromConstructor(HeroChallengeLegendaryExplorer0)
						for (let i = 0; i < 3; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitChallengeScarredExplorer)
						}
						for (let i = 0; i < 6; i++) {
							Keywords.addCardToHand.for(owner).fromConstructor(UnitChallengeEagerExplorer)
						}
					})
			)

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanPlayer())
			.require(({ game }) => this.getState(game).nessaPlayed === true)
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('And so ends the fierce battle...')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('Fierce? You just cheated! From the very beginning!')
					.say('Dummies are not supposed to be 50-power cards, and they are <b>definitely</b> not supposed to be immune!')
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Who are you supposed to be?')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('Uhm... Me?')
					.say("It's written right here. A bit up. No?")
					.setCharacter(StoryCharacter.NARRATOR)
					.say('"Not Nessa", sure. But if not Nessa, then who?')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('I... I gotta go. Bye!')
					.removeCharacter(StoryCharacter.NOT_NESSA)
					.setCharacter(StoryCharacter.NARRATOR)
					.say('...')
					.say(
						`And so ends the fierce battle of ${
							game.getHumanPlayer()!.player.username
						}, definitely-not-Nessa, and the Overcharged Target Dummy.`
					)
					.say('Hope you enjoyed this little adventure!')

				if (game.getHumanPlayer()!.player.username.includes('Nenl') && new Date().getDate() === 31 && new Date().getMonth() === 4) {
					game.novel
						.startDialog()
						.setCharacter(StoryCharacter.NARRATOR)
						.say('...')
						.say('Oh, and one more thing.')
						.say('Happy birthday! 🎂')
						.say(':)')
				}
			})

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer === game.getHumanPlayer())
			.require(({ game }) => this.getState(game).nessaPlayed === false)
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('...')
					.say('Am confused.')
					.say('...')
					.say(
						'You have managed to win while skipping most of the script. Including the part where you get completely overpowered cards to counter the immune dummies.'
					)
					.say('Is my game <i>that</i> broken?')
					.say('Granted, you have infinite tries, and you know exactly what the enemy will do, but still...')
					.say('...')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say("Hey, don't be sad, you mighty dragon!")
					.say(
						'You made this entire story, you wrote every single one of those words, coded basically every single thing that exists in this game.'
					)
					.say("So what if it's a bit broken? Wasn't that the point, that the State of <b>Imbalance</b> is a bit, you know, imbalanced?")
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Fair point.')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say('See? So you want me to give you a hug?')
					.setCharacter(StoryCharacter.NARRATOR)
					.say('...')
					.setCharacter(StoryCharacter.NOT_NESSA)
					.say("I'll take it as a yes.")
					.say('And you, player. What do you think about this whole adventure? Nessadventure, as a certain someone would call it.')
					.reply("It was amazing! I'll give it a ten!", () => onFeedbackGreat(game))
					.reply("I'll give it a... three.", () => onFeedbackMeh(game))
					.reply('A broken pile of steaming garbage.', () => onFeedbackBad(game))
			})

		const onFeedbackGreat = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.setCharacter(StoryCharacter.NARRATOR)
				.say("You're just saying that to make me feel better, don't you?")
				.setCharacter(StoryCharacter.NOT_NESSA)
				.say("No, they're saying that because the adventure was great!")
				.say("Can't you just be happy with what you have done for once?")
				.setCharacter(StoryCharacter.NARRATOR)
				.say('Nope.')
				.setCharacter(StoryCharacter.NOT_NESSA)
				.say('It seems more hugs are in order.')
				.say('Thank you for playing, player. We are <b>both</b> glad you enjoyed it, and we wish to see you again soon!')
		}

		const onFeedbackMeh = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.setCharacter(StoryCharacter.NARRATOR)
				.say('Well, considering that it went idea to implementation in a day...')
				.say('I guess that is a fair assessment.')
				.setCharacter(StoryCharacter.NOT_NESSA)
				.say("Shush, both! It was great, and you can't claim otherwise!")
				.say('And you, player, get out and think about your attitude.')
				.say("Break the game again or read the source code to see the other endings, I don't care.")
		}

		const onFeedbackBad = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.setCharacter(StoryCharacter.NARRATOR)
				.say('...')
				.setCharacter(StoryCharacter.NOT_NESSA)
				.say('...')
				.say('Get. Out.')
		}

		this.createCallback(GameEventType.GAME_FINISHED)
			.require(({ game, victoriousPlayer }) => victoriousPlayer !== game.getHumanPlayer())
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say('Uhm...')
					.say('I am sorry. That was not my intention.')
					.say('...')
					.say('This was supposed a very easy little joke scenario. Not sure what went wrong.')
					.say('...')
					.say('Do you mind trying again? Just... go with the script, okay?')
					.say('Or not. Your choice. Not like I can force you.')
					.say('...')
					.say('...')
					.say('...')
					.say('See you in a bit? I hope.')
			})
	}
}
