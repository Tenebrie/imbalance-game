import GameMode from '@src/../../shared/src/enums/GameMode'
import RulesetCategory from '@src/../../shared/src/enums/RulesetCategory'
import { ServerRulesetBuilder } from '@src/game/models/rulesets/ServerRuleset'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import AIBehaviour from '@src/../../shared/src/enums/AIBehaviour'
import LeaderCampfireTheMother from '@src/game/cards/10-challenge/test-campfire/LeaderCampfireTheMother'
import BoardSplitMode from '@src/../../shared/src/enums/BoardSplitMode'
import HeroCampfireProtagonist from '@src/game/cards/10-challenge/test-campfire/HeroCampfireProtagonist'
import LeaderCampfireThePlayer from '@src/game/cards/10-challenge/test-campfire/LeaderCampfireThePlayer'
import HeroCampfireElsa from '@src/game/cards/10-challenge/test-campfire/HeroCampfireElsa'
import UnitCampfireTree from '@src/game/cards/10-challenge/test-campfire/UnitCampfireTree'
import UnitCampfireBlackChair from '@src/game/cards/10-challenge/test-campfire/UnitCampfireBlackChair'
import HeroCampfireBodge from '@src/game/cards/10-challenge/test-campfire/HeroCampfireBodge'
import HeroCampfireNira from '@src/game/cards/10-challenge/test-campfire/HeroCampfireNira'
import UnitCampfireFire from '@src/game/cards/10-challenge/test-campfire/UnitCampfireFire'
import UnitCampfireEmptySpace from '@src/game/cards/10-challenge/test-campfire/UnitCampfireEmptySpace'
import GameEventType from '@src/../../shared/src/enums/GameEventType'
import Keywords from '@src/utils/Keywords'
import StoryCharacter from '@src/../../shared/src/enums/StoryCharacter'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetCampfire extends ServerRulesetBuilder<void> {
	constructor() {
		super({
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
		})

		this.updateConstants({
			SKIP_MULLIGAN: true,
			PLAYER_MOVES_FIRST: true,
			UNIT_HAND_SIZE_STARTING: 25,
			GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode.ALL_FOR_PLAYER,
		})

		this.createAI([LeaderCampfireTheMother, { card: UnitChallengeDummyOPWarrior, count: 25 }]).behave(AIBehaviour.PASSIVE)
		this.createDeck().fixed([LeaderCampfireThePlayer, HeroCampfireProtagonist])

		this.createBoard().player([
			[HeroCampfireElsa, UnitCampfireBlackChair],
			[UnitCampfireTree, UnitCampfireTree, UnitCampfireTree, UnitCampfireTree, UnitCampfireTree],
			[HeroCampfireBodge],
			[HeroCampfireNira, UnitCampfireFire, UnitCampfireEmptySpace],
			[UnitCampfireEmptySpace],
			[UnitCampfireTree, UnitCampfireTree, UnitCampfireTree, UnitCampfireTree, UnitCampfireTree],
		])

		/* [====================================================]
		 * Dialog: Stealing Elsa's chair
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return !!adjacentUnits.find((unit) => unit.card instanceof UnitCampfireBlackChair)
			})
			.perform(({ game, triggeringUnit }) => {
				const owner = triggeringUnit.owner
				game.board.destroyUnit(triggeringUnit)
				Keywords.addCardToHand.for(owner).fromConstructor(HeroCampfireProtagonist)
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.setCharacter(StoryCharacter.NARRATOR)
					.say("You contemplate stealing Elsa's chair from underneath her.")
					.say('...')
					.say('You decide against it.')
			})

		/* [====================================================]
		 * Dialog: Chatting to Elsa
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.card instanceof HeroCampfireProtagonist)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return (
					!!adjacentUnits.find((unit) => unit.card instanceof HeroCampfireElsa) &&
					!adjacentUnits.find((unit) => unit.card instanceof UnitCampfireBlackChair)
				)
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.parse(
						`
						Elsa:
						> They are still growing in numbers.
						Narrator: 
						> The self-proclaimed Queen of Ravens starts speaking as soon as you approach, without even turning her head towards you.
						Elsa:
						> They are not stopping to rest, not stopping to replenish or gather supplies.
						> Does humanity even stand a chance against such a menace?
						Protagonist:
						> ...

						>>> I have trust that we will. Stay strong.
						-->
							Elsa:
							> It is not about me being strong. I am not the one the Mother puts her eye upon.
							>>> [Continue] -> ElsaConcerned
						<--

						>>> We have prevailed against other threats in the past. How is this different?
						-->
							Elsa:
							> The so-called 'heroes', that's how.
							> There always was somebody who intervened, either on the basis of their exceptional skills, or after being given a gift from the gods.
							> Keeping track of rumors is my calling, and trust me when I say I have not heard about anybody stepping forward to fight the Scourge.
							Protagonist:
							> ...

							>>> What if I am the one?
							-->
								Narrator:
								> She finally turns over and measures you with her gaze.
								Elsa:
								> In that case I expect us to turn around on sunrise and stop running away.
								Narrator:
								> Elsa turns back and relaxes on her chair.
								Elsa:
								> Nevertheless, did you need something from me?
								>>> [Continue] -> HubZone
							<--

							>>> Somebody will step up
							-->
								Elsa:
								> Then they definitely need to hurry.
								> Soon there will be nothing left of the once-proud "Empire of Man".
								> Nevertheless, did you need something from me?
								>>> [Continue] -> HubZone
							<--

							>>> Why do you even care?
							-->
								Narrator:
								> She takes a moment to think.
								Elsa:
								> I have my reasons.
								> Nevertheless, did you need something from me?
								>>> [Continue] -> HubZone
							<--
						<--

						>>> Can't say I believe it.
						-->
							Elsa:
							> Neither do I.
							> ...
							> I suppose it is time for us to look for better lives elsewhere. However... even if we live, it doesn't help us. The swarm has a very specific goal in their shared mind.
							>>> [Continue] -> ElsaConcerned
						<--

						=== ElsaConcerned ===
						Elsa:
						> It is you. Wherever we go, the Scourge does. They follow <i>us</i>, and that...
						> ...
						> Is concerning.
						Protagonist:
						> ...
						
						>>> You are right. It is me.
						-->
							Narrator:
							> You meant to tell Elsa about your visions and the Mother appearing to you at night...
							> ...but you do not feel like this is a good moment.
							Elsa:
							> ...
							> Nevertheless, did you need something from me?
							>>> [Continue] -> HubZone
						<--

						>>> How can you be sure they are following us?
						-->
							Elsa:
							> Look at the map. It's almost like we are the ones leaving the trail of destruction behind us.
							> My birds follow the Scourge closely, and they always move in a straight line towards us.
							> The only thing really stopping them are the pockets of resistance the Empire is trying to set up.
							> If it wasn't for humans trying to slow the Mother down, she would have been here already.
							Protagonist:
							> ...

							>>> How are they doing?
							-->
								Elsa:
								> ...
								> Not well.
								> Nevertheless, did you need something from me?
								>>> [Continue] -> HubZone
							<--

							>>> [Stay silent]
							-->
								Elsa:
								> Nevertheless, did you need something from me?
								>>> [Continue] -> HubZone
							<--
						<--
						/==
						`
					)
					.createTag('HubZone', () => onElsaDialogHub(game))
			})
		const onElsaDialogHub = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.setCharacter(StoryCharacter.PROTAGONIST)
				.say('...')
				.reply('Nothing. Just checking up on you.', (dialog) => {
					dialog
						.setCharacter(StoryCharacter.NARRATOR)
						.say('She nods')
						.setCharacter(StoryCharacter.ELSA)
						.say('I appreciate it.')
						.setCharacter(StoryCharacter.PROTAGONIST)
						.say('...')
						.reply('Stay here for a while longer', () => onEnding(game))
						.reply('Return to the campfire', () => onEnding(game))
				})
				.reply('Wanted to ask a question', (dialog) => {
					dialog
						.setCharacter(StoryCharacter.ELSA)
						.say("Can't say I am now in the mood for questions.")
						.say('Ask me again tomorrow though.')
						.reply('[Continue]', () => onElsaDialogHub(game))
				})
		}

		/* [====================================================]
		 * Dialog: Moving Nira away
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.card instanceof HeroCampfireProtagonist)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return !!(
					adjacentUnits.find((unit) => unit.card instanceof UnitCampfireFire) &&
					adjacentUnits.find((unit) => unit.card instanceof HeroCampfireNira)
				)
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.parse(
						`
					Nira:
					> ... and when she could chirp again, she exclaimed, "Now imagine if I had <i>hands</i>!".
					Narrator:
					> The forest clearing has filled with the beautiful laughter of the young dryad.
					> She was, however, the only one who liked her own joke.
					> While she's still laughing, you sit right beside Nira, moving one of her four legs away in the process.
					Nira:
					> ...
					> Now, excuse me! That is <i>my</i> favorite spot!
					Protagonist:
					> ...

					>>> Oh, I am sorry.
					-->
						Nira:
						> No worries. You can have it.
						>>> [Continue] -> PranceAway
					<--

					>>> My spot now!
					-->
						Nira:
						> ...
						> Meanie.
						>>> [Continue] -> PranceAway
					<--

					>>> Aren't you cold? Because I was.
					-->
						Nira:
						> Oh! I am sorry then! Let me try to find something to keep you warm!
						Protagonist:
						> ...

						>>> But I am warm next to you!
						-->
							Nira:
							> Oh... then we can share!
							Narrator:
							> The dryad moves a little to give you enough space, while still keeping close to you.
							Nira:
							> Is this warm enough?
							Protagonist:
							> ...
							>>> Yes. Now what was that joke about? -> PunTimes
						<--
						>>> No, wait, that's not what I meant.
						-->
							Nira:
							> Not that?
							Narrator:
							> The dryad looks confused.
							Nira:
							> You humans are weird creatures.
							>>> [Continue] -> PranceAway
						<--
						>>> Feeling quite warm already, you don't need to worry.
						-->
							Nira:
							> You are?
							Narrator:
							> The dryad looks confused.
							Nira:
							> You humans are weird creatures.
							>>> [Continue] -> PranceAway
						<--
					<--
					`
					)
					.createTag('PranceAway', (dialog) => {
						const targetSpot = game.board
							.getAllUnits()
							.find((unit) => unit.card instanceof UnitCampfireEmptySpace && game.board.getAdjacentUnits(unit).length === 0)!
						const rowIndex = targetSpot.rowIndex
						game.animation.instantThread(() => {
							Keywords.destroy.unit(targetSpot).withoutSource()
						})
						game.animation.instantThread(() => {
							const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
							Keywords.move.unit(dryad).toPosition(rowIndex, 0)
						})
						game.animation.syncAnimationThreads()

						dialog.parse(
							`
						Nira:
						> I sit here now!
						Narrator:
						> She smiles. This little creature of the forest seemingly can't hold a grudge for longer than two seconds.
						>>> What was that joke about? -> PunTimes
						`
						)
					})
					.createTag('PunTimes', () => onPunTimesDialogStart(game))
			})

		/* [====================================================]
		 * Dialog: Sitting beside Bodge
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.card instanceof HeroCampfireProtagonist)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return !!adjacentUnits.find((unit) => unit.card instanceof HeroCampfireBodge)
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.parse(
						`
					Nira:
					> ... and when she could chirp again, she exclaimed, "Now imagine if I had <i>hands</i>!".
					Narrator:
					> The forest clearing has filled with the beautiful laughter of the young dryad.
					> She was, however, the only one who liked her own joke.
					> While she's still laughing, you sit right beside Bodge, who doesn't even acknowledge your presence.
					> He does, however, shuffle to the side slightly, so you have enough space to sit comfortably.
					Bodge:
					> Mhm.
					Nira:
					> Oh, hello there!
					Protagonist:
					> ...

					>>> What was that joke about? -> PunTimes
					`
					)
					.createTag('PunTimes', () => onPunTimesDialogStart(game))
			})

		/* [====================================================]
		 * Dialog: Sitting behind Nira
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.card instanceof HeroCampfireProtagonist)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return adjacentUnits.length === 1 && !!adjacentUnits.find((unit) => unit.card instanceof HeroCampfireNira)
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.parse(
						`
					Nira:
					> ... and when she could chirp again, she exclaimed, "Now imagine if I had <i>hands</i>!".
					Narrator:
					> You sit down behind the dryad trying not to attract too much attention to yourself. She does, however, notice you immediately.
					Nira:
					> Oh, hello there! Please, sit near the fire!
					>>> [Continue] -> PranceAway
					`
					)
					.createTag('PranceAway', (dialog) => {
						const targetSpot = game.board
							.getAllUnits()
							.find((unit) => unit.card instanceof UnitCampfireEmptySpace && game.board.getAdjacentUnits(unit).length === 0)!
						const rowIndex = targetSpot.rowIndex
						game.animation.instantThread(() => {
							Keywords.destroy.unit(targetSpot).withoutSource()
						})
						game.animation.instantThread(() => {
							const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
							Keywords.move.unit(dryad).toPosition(rowIndex, 0)
						})
						game.animation.syncAnimationThreads()

						dialog.parse(
							`
						Nira:
						> I sit here, you sit there!
						Narrator:
						> She smiles. 
						>>> What was that joke about? -> PunTimes
						`
						)
					})
					.createTag('PunTimes', () => onPunTimesDialogStart(game))
			})

		/* [====================================================]
		 * Dialog: Sitting on empty spot
		 * [====================================================]
		 */
		this.createCallback(GameEventType.UNIT_CREATED)
			.require(({ triggeringUnit }) => triggeringUnit.card instanceof HeroCampfireProtagonist)
			.require(({ game, triggeringUnit }) => {
				const adjacentUnits = game.board.getAdjacentUnits(triggeringUnit)
				return (
					(adjacentUnits.length === 1 && !!adjacentUnits.find((unit) => unit.card instanceof UnitCampfireEmptySpace)) ||
					(!!adjacentUnits.find((unit) => unit.card instanceof UnitCampfireEmptySpace) &&
						!!adjacentUnits.find((unit) => unit.card instanceof UnitCampfireFire))
				)
			})
			.perform(({ game }) => {
				const targetSpot = game.board
					.getAllUnits()
					.find(
						(unit) =>
							unit.card instanceof UnitCampfireEmptySpace &&
							game.board.getAdjacentUnits(unit).find((adjacent) => adjacent.card instanceof HeroCampfireProtagonist)
					)!
				Keywords.destroy.unit(targetSpot).withoutSource()
			})
			.perform(({ game }) => {
				game.novel
					.startDialog()
					.parse(
						`
					Nira:
					> ... and when she could chirp again, she exclaimed, "Now imagine if I had <i>hands</i>!".
					Narrator:
					> You sit down on an empty spot next to the campfire. Nira and Bodge sit beside you, both preoccupied with their task.
					> Nira has just finished telling a silly joke about a bird performing less-than-noble activities, and Bodge just keeps cleaning his weapon.
					Nira:
					> Oh, hello there!
					Protagonist:
					> ...

					>>> What was that joke about? -> PunTimes
					`
					)
					.createTag('PunTimes', () => onPunTimesDialogStart(game))
			})

		const onPunTimesDialogStart = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.parse(
					`
				Nira:
				> Oh, you didn't hear it? Ok, so there was this little...
				Bodge:
				> Bird crap.
				Nira:
				> ...excuse you?
				Bodge:
				> Her joke was about some bird crapping itself. Not particularly funny.
				Nira:
				> No, it wasn't! It was about this little bird, who...
				Bodge:
				> Crapped itself.
				Nira:
				> You didn't even listen to me telling the story!!!
				Bodge:
				> I've heard the middle.
				Nira:
				> ...
				Narrator:
				> The dryad looked at the man with an anger so intense, like she was about to throw the heaviest acorn around right at his head.
				Nira:
				> You want to tell a better joke then?!
				Bodge:
				> Nah.
				Nira:
				> Urgh! You people are <i>unbearable</i>!
				Bodge:
				> You're wrong again.
				Nira:
				> ...
				Bodge:
				> I've ridden a bear before, and I can confirm that I am very <i>bearable</i>.

				Protagonist:
				> ...

				>>> [Chuckle]
				-->
					Bodge:
					> At least someone appreciates it.
					Nira:
					> ...
					Bodge:
					> ...
					Nira:
					> Okay! Fine! It was a good joke.
					Bodge:
					> Thank you, <i>deer</i>.
					Nira:
					> ...
					> OH I'LL GET YOU NOW!
					>>> [Continue] -> Fireplace
				<--
				>>> [Ignore]
				-->
					Bodge:
					> Fine, it was not my finest pun.
					Nira:
					> More like a finest <i>dum</i>!
					Bodge:
					> ...
					> Still better than that one for sure.
					Nira:
					> You are no fun.
					>>> [Continue] -> Fireplace
				<--
				`
				)
				.createTag('Fireplace', () => onFireplaceDialogStart(game))
		}

		const onFireplaceDialogStart = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.parse(
					`
				Narrator:
				> You spend the rest of the evening talking about whatever it is that comes to your mind.
				> Mostly puns though.
				> After landing another dreadful joke about a sailor and his wife, Bodge suddenly looks as if he remembered something.
				Bodge:
				> Oh. I actually forgot I have this.
				Narrator:
				> He pulls a sizeable flask out of his bag.
				Bodge:
				> My second-to-last reserve. Good stuff from the east. Anybody wants to try some of the meanest spirits the pink-skinned alchemists ever conceived?
				Nira:
				> No thanks.
				Protagonist:
				> ...

				>>> I don't mind.
				-->
					Narrator:
					> You take a sip out of the flask and immediately feel that the guy wasn't joking.
					> You struggle to keep it in, but in the end you manage to swallow the fiery liquid.
					Bodge:
					> Not everyone can take this thing on their first try, you know. You're stronger than you look.
					>>> [Continue] -> NextStage
				<--
				>>> I'll pass as well
				-->
					Bodge:
					> Well then, more for me.
					Narrator:
					> He consumes the entire contents of the flask as if it was water.
					Bodge:
					> Alright, so where were we?
					>>> [Continue] -> NextStage
				<--

				=== NextStage ===
				Narrator:
				> Nira has looked to the sky while trying not to look at all the alcoholic consumption, and she suddenly jumped up, as if she has remembered something important.
				Nira:
				> It's getting late. I... need to go.
				>>> Hey, wait!
				-->
					Narrator:
					> But she was already gone
					>>> [Continue] -> StageThree
				<--
				>>> Where are you going?
				-->
					Narrator:
					> But she was already gone
					>>> [Continue] -> StageThree
				<--
				>>> [Ignore] -> StageThree
				/==
				`
				)
				.createTag('StageThree', (dialog) => {
					const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
					Keywords.move.unit(dryad).toPosition(5, 3)
					Keywords.destroy.unit(dryad).withoutSource()
					dialog.parse(
						`
						Bodge:
						> That was quick. Again.
						Protagonist:
						> ...
						>>> Well, she <i>is</i> a dryad, after all.
						-->
							Bodge:
							> True, but that is not an excuse to be acting like that.
							> Anyway. She'll be back in the morning like nothing ever happened.
							Protagonist:
							> ...
							>>> I hope so -> Ending
							>>> As she always does -> Ending
							>>> [Stay silent] -> Ending
						<--
						`
					)
				})
				.createTag('Ending', () => onEnding(game))
		}

		const onEnding = (game: ServerGame): void => {
			game.novel
				.startDialog()
				.parse(
					`
					Narrator:
					> ...
					> And so ends our little slice of story.
					> You are getting ready to sleep today and preparing yourself for the challenges to come.
					> The night will be long, quiet and uneventful.
					> ...
					> ...
					> You say this is too short?
					> Well, it is a prototype after all. What else did you expect?
					>>> [End] -> Ending
					`
				)
				.createTag('Ending', () => game.finish(game.getHumanPlayer(), 'Story trigger'))
		}
	}
}
