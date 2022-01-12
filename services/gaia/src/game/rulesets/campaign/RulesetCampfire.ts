import AIBehaviour from '@shared/enums/AIBehaviour'
import BoardSplitMode from '@shared/enums/BoardSplitMode'
import GameEventType from '@shared/enums/GameEventType'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import GameVictoryCondition from '@src/enums/GameVictoryCondition'
import UnitChallengeDummyOPWarrior from '@src/game/cards/10-challenge/ai-00-dummy/UnitChallengeDummyOPWarrior'
import HeroCampfireBodge from '@src/game/cards/10-challenge/test-campfire/HeroCampfireBodge'
import HeroCampfireElsa from '@src/game/cards/10-challenge/test-campfire/HeroCampfireElsa'
import HeroCampfireNira from '@src/game/cards/10-challenge/test-campfire/HeroCampfireNira'
import HeroCampfireProtagonist from '@src/game/cards/10-challenge/test-campfire/HeroCampfireProtagonist'
import LeaderCampfireTheMother from '@src/game/cards/10-challenge/test-campfire/LeaderCampfireTheMother'
import LeaderCampfireThePlayer from '@src/game/cards/10-challenge/test-campfire/LeaderCampfireThePlayer'
import UnitCampfireBlackChair from '@src/game/cards/10-challenge/test-campfire/UnitCampfireBlackChair'
import UnitCampfireEmptySpace from '@src/game/cards/10-challenge/test-campfire/UnitCampfireEmptySpace'
import UnitCampfireFire from '@src/game/cards/10-challenge/test-campfire/UnitCampfireFire'
import UnitCampfireTree from '@src/game/cards/10-challenge/test-campfire/UnitCampfireTree'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import { ServerGameNovelCreator } from '@src/game/models/ServerGameNovel'
import Keywords from '@src/utils/Keywords'

export default class RulesetCampfire extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				UNIT_HAND_SIZE_STARTING: 25,
				GAME_BOARD_ROW_SPLIT_MODE: BoardSplitMode.ALL_FOR_PLAYER,
			},
		})

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderCampfireThePlayer, HeroCampfireProtagonist],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.PASSIVE,
				deck: [LeaderCampfireTheMother, { card: UnitChallengeDummyOPWarrior, count: 25 }],
			})

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
				game.board.destroyUnit(triggeringUnit)
				Keywords.addCardToHand.for(triggeringUnit.originalOwner).fromConstructor(HeroCampfireProtagonist)
			})
			.perform(({ game }) => {
				game.novel.startDialog(`
					Narrator:
					> You contemplate stealing Elsa's chair from underneath her.
					> ...
					> You decide against it.
					`)
			})

		/* [====================================================]
		 * Dialog: Chatting to Elsa
		 * [====================================================]
		 */
		enum ElsaChapters {
			Concerned,
			HubZone,
			Ending,
		}

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
					.startDialog(
						() => `
						Elsa:
						> They are still growing in numbers.
						Narrator:
						> The self-proclaimed Queen of Ravens starts speaking as soon as you approach, without even turning her head towards you.
						Elsa:
						> They are not stopping to rest, not stopping to replenish or gather supplies.
						> Does humanity even stand a chance against such a menace?
						Protagonist:
						> ...

						@ I have trust that we will. Stay strong.
							Elsa:
							> It is not about me being strong. I am not the one the Mother puts her eye upon.
							@ [Continue] -> ${ElsaChapters.Concerned}

						@ We have prevailed against other threats in the past. How is this different?
							Elsa:
							> The so-called 'heroes', that's how.
							> There always was somebody who intervened, either on the basis of their exceptional skills, or after being given a gift from the gods.
							> Keeping track of rumors is my calling, and trust me when I say I have not heard about anybody stepping forward to fight the Scourge.
							Protagonist:
							> ...

							@ What if I am the one?
								Narrator:
								> She finally turns over and measures you with her gaze.
								Elsa:
								> In that case I expect us to turn around on sunrise and stop running away.
								Narrator:
								> Elsa turns back and relaxes on her chair.
								Elsa:
								> Nevertheless, did you need something from me?
								@ [Continue] -> ${ElsaChapters.HubZone}

							@ Somebody will step up
								Elsa:
								> Then they definitely need to hurry.
								> Soon there will be nothing left of the once-proud "Empire of Man".
								> Nevertheless, did you need something from me?
								@ [Continue] -> ${ElsaChapters.HubZone}

							@ Why do you even care?
								Narrator:
								> She takes a moment to think.
								Elsa:
								> I have my reasons.
								> Nevertheless, did you need something from me?
								@ [Continue] -> ${ElsaChapters.HubZone}

						@ Can't say I believe it.
							Elsa:
							> Neither do I.
							> ...
							> I suppose it is time for us to look for better lives elsewhere. However... even if we live, it doesn't help us. The swarm has a very specific goal in their shared mind.
							@ [Continue] -> ${ElsaChapters.Concerned}

						${ElsaChapters.Concerned}:
							Elsa:
							> It is you. Wherever we go, the Scourge does. They follow us, and that...
							> ...
							> Is concerning.
							Protagonist:
							> ...
							
							@ You are right. It is me.
								Narrator:
								> You meant to tell Elsa about your visions and the Mother appearing to you at night...
								> ...but you do not feel like this is a good moment.
								Elsa:
								> ...
								> Nevertheless, did you need something from me?
								@ [Continue] -> ${ElsaChapters.HubZone}
	
							@ How can you be sure they are following us?
								Elsa:
								> Look at the map. It's almost like we are the ones leaving the trail of destruction behind us.
								> My birds follow the Scourge closely, and they always move in a straight line towards us.
								> The only thing really stopping them are the pockets of resistance the Empire is trying to set up.
								> If it wasn't for humans trying to slow the Mother down, she would have been here already.
								Protagonist:
								> ...
	
								@ How are they doing?
									Elsa:
									> ...
									> Not well.
									> Nevertheless, did you need something from me?
									@ [Continue] -> ${ElsaChapters.HubZone}
	
								@ [Stay silent]
									Elsa:
									> Nevertheless, did you need something from me?
									@ [Continue] -> ${ElsaChapters.HubZone}
						`
					)
					.continue(ElsaChapters.HubZone, onElsaDialogHub)
			})
		const onElsaDialogHub = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return novel
				.exec(
					() => `
					Protagonist:
					> ...
					@ Nothing. Just checking up on you.
						Narrator:
						> She nods.
						Elsa:
						> I appreciate it.
						> ...
						@ Stay here for a while longer -> ${ElsaChapters.Ending}
						@ Return to the campfire -> ${ElsaChapters.Ending}
					
					@ Wanted to ask a question
						Elsa:
						> Can't say I am now in the mood for questions.
						> Ask me again tomorrow though.
						@ [Continue] -> ${ElsaChapters.Ending}
				`
				)
				.continue(ElsaChapters.Ending, onEnding)
		}

		/* [====================================================]
		 * Dialog: Moving Nira away
		 * [====================================================]
		 */
		enum NiraChapters {
			PranceAway,
			NextStage,
			StageThree,
			Fireplace,
			PunTimes,
			Ending,
			FinishGame,
		}

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
					.startDialog(
						() => `
						Nira:
						> ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
						Narrator:
						> The forest clearing has filled with the beautiful laughter of the young dryad.
						> She was, however, the only one who liked her own joke.
						> While she's still laughing, you sit right beside Nira, moving one of her four legs away in the process.
						Nira:
						> ...
						> Now, excuse me! That is my favorite spot!
						Protagonist:
						> ...
	
						@ Oh, I am sorry.
							Nira:
							> No worries. You can have it.
							@ [Continue] -> ${NiraChapters.PranceAway}
	
						@ My spot now!
							Nira:
							> ...
							> Meanie.
							@ [Continue] -> ${NiraChapters.PranceAway}
	
						@ Aren't you cold? Because I was.
							Nira:
							> Oh! I am sorry then! Let me try to find something to keep you warm!
							Protagonist:
							> ...
	
							@ But I am warm next to you!
								Nira:
								> Oh... then we can share!
								Narrator:
								> The dryad moves a little to give you enough space, while still keeping close to you.
								Nira:
								> Is this warm enough?
								Protagonist:
								> ...
								@ Yes. Now what was that joke about? -> ${NiraChapters.PunTimes}
								
							@ No, wait, that's not what I meant.
								Nira:
								> Not that?
								Narrator:
								> The dryad looks confused.
								Nira:
								> You humans are weird creatures.
								@ [Continue] -> ${NiraChapters.PranceAway}
								
							@ Feeling quite warm already, you don't need to worry.
								Nira:
								> You are?
								Narrator:
								> The dryad looks confused.
								Nira:
								> You humans are weird creatures.
								@ [Continue] -> ${NiraChapters.PranceAway}
					`
					)
					.chapter(NiraChapters.PranceAway, () => {
						const targetSpot = game.board
							.getAllUnits()
							.find((unit) => unit.card instanceof UnitCampfireEmptySpace && game.board.getAdjacentUnits(unit).length === 0)!
						const rowIndex = targetSpot.rowIndex
						game.animation.instantThread(() => {
							Keywords.destroy.unit(targetSpot).withoutSource()
						})
						game.animation.instantThread(() => {
							const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
							Keywords.moveUnit(dryad, rowIndex, 0)
						})
						game.animation.syncAnimationThreads()

						return `
							Nira:
							> I sit here now!
							Narrator:
							> She smiles. This little creature of the forest seemingly can't hold a grudge for longer than two seconds.
							@ What was that joke about? -> ${NiraChapters.PunTimes}
						`
					})
					.continue(NiraChapters.PunTimes, onPunTimesDialogStart)
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
					.startDialog(
						() => `
					Nira:
					> ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
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
					@ What was that joke about? -> ${NiraChapters.PunTimes}
					`
					)
					.continue(NiraChapters.PunTimes, onPunTimesDialogStart)
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
					.startDialog(
						() => `
						Nira:
						> ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
						Narrator:
						> You sit down behind the dryad trying not to attract too much attention to yourself. She does, however, notice you immediately.
						Nira:
						> Oh, hello there! Please, sit near the fire!
						@ [Continue] -> ${NiraChapters.PranceAway}
					`
					)
					.chapter(NiraChapters.PranceAway, () => {
						const targetSpot = game.board
							.getAllUnits()
							.find((unit) => unit.card instanceof UnitCampfireEmptySpace && game.board.getAdjacentUnits(unit).length === 0)!
						const rowIndex = targetSpot.rowIndex
						game.animation.instantThread(() => {
							Keywords.destroy.unit(targetSpot).withoutSource()
						})
						game.animation.instantThread(() => {
							const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
							Keywords.moveUnit(dryad, rowIndex, 0)
						})
						game.animation.syncAnimationThreads()

						return `
							Nira:
							> I sit here, you sit there!
							Narrator:
							> She smiles. 
							@ What was that joke about? -> ${NiraChapters.PunTimes}
						`
					})
					.continue(NiraChapters.PunTimes, onPunTimesDialogStart)
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
					.startDialog(
						() => `
						Nira:
						> ... and when she could chirp again, she exclaimed, "Now imagine if I had hands!".
						Narrator:
						> You sit down on an empty spot next to the campfire. Nira and Bodge sit beside you, both preoccupied with their task.
						> Nira has just finished telling a silly joke about a bird performing less-than-noble activities, and Bodge just keeps cleaning his weapon.
						Nira:
						> Oh, hello there!
						Protagonist:
						> ...
						@ What was that joke about? -> ${NiraChapters.PunTimes}
					`
					)
					.continue(NiraChapters.PunTimes, onPunTimesDialogStart)
			})

		const onPunTimesDialogStart = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return novel
				.exec(
					() => `
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
					> Urgh! You people are unbearable!
					Bodge:
					> You're wrong again.
					Nira:
					> ...
					Bodge:
					> I've ridden a bear before, and I can confirm that I am very bearable.
	
					Protagonist:
					> ...
	
					@ [Chuckle]
						Bodge:
						> At least someone appreciates it.
						Nira:
						> ...
						Bodge:
						> ...
						Nira:
						> Okay! Fine! It was a good joke.
						Bodge:
						> Thank you, deer.
						Nira:
						> ...
						> OH I'LL GET YOU NOW!
						@ [Continue] -> ${NiraChapters.Fireplace}
					@ [Ignore]
						Bodge:
						> Fine, it was not my finest pun.
						Nira:
						> More like a finest dum!
						Bodge:
						> ...
						> Still better than that one for sure.
						Nira:
						> You are no fun.
						@ [Continue] -> ${NiraChapters.Fireplace}
				`
				)
				.continue(NiraChapters.Fireplace, onFireplaceDialogStart)
		}

		const onFireplaceDialogStart = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return novel
				.exec(
					() => `
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
					@ I don't mind.
						Narrator:
						> You take a sip out of the flask and immediately feel that the guy wasn't joking.
						> You struggle to keep it in, but in the end you manage to swallow the fiery liquid.
						Bodge:
						> Not everyone can take this thing on their first try, you know. You're stronger than you look.
						@ [Continue] -> ${NiraChapters.NextStage}
					@ I'll pass as well
						Bodge:
						> Well then, more for me.
						Narrator:
						> He consumes the entire contents of the flask as if it was water.
						Bodge:
						> Alright, so where were we?
						@ [Continue] -> ${NiraChapters.NextStage}

					${NiraChapters.NextStage}:
						Narrator:
						> Nira has looked to the sky while trying not to look at all the alcoholic consumption, and she suddenly jumped up, as if she has remembered something important.
						Nira:
						> It's getting late. I... need to go.
						@ Hey, wait!
							Narrator:
							> But she was already gone
							@ [Continue] -> ${NiraChapters.StageThree}
						@ Where are you going?
							Narrator:
							> But she was already gone
							@ [Continue] -> ${NiraChapters.StageThree}
						@ [Ignore] -> ${NiraChapters.StageThree}
				`
				)
				.chapter(NiraChapters.StageThree, () => {
					const dryad = game.board.getAllUnits().find((unit) => unit.card instanceof HeroCampfireNira)!
					Keywords.moveUnit(dryad, 5, 3)
					Keywords.destroy.unit(dryad).withoutSource()
					return `
						Bodge:
						> That was quick. Again.
						Protagonist:
						> ...
						@ Well, she is a dryad, after all.
							Bodge:
							> True, but that is not an excuse to be acting like that.
							> Anyway. She'll be back in the morning like nothing ever happened.
							> ...
							@ I hope so
							@ As she always does
							@ [Stay silent]
							--> ${NiraChapters.Ending}
					`
				})
				.continue(NiraChapters.Ending, onEnding)
		}

		const onEnding = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return novel
				.exec(
					() => `
					Narrator:
					> ...
					> And so ends our little slice of story.
					> You are getting ready to sleep today and preparing yourself for the challenges to come.
					> The night will be long, quiet and uneventful.
					> ...
					> ...
					> You say this is too short?
					> Well, it is a prototype after all. What else did you expect?
					--> ${NiraChapters.FinishGame}
				`
				)
				.closingChapter(NiraChapters.FinishGame, () => {
					game.playerFinish(game.getHumanGroup(), GameVictoryCondition.STORY_TRIGGER)
				})
		}
	}
}
