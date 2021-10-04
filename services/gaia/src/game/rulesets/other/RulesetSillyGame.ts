import AIBehaviour from '@shared/enums/AIBehaviour'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import GameEventType from '@src/../../../shared/src/enums/GameEventType'
import LeaderMaximilian from '@src/game/cards/00-human/leaders/Maximilian/LeaderMaximilian'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'
import { ServerGameNovelCreator } from '@src/game/models/ServerGameNovel'

export default class RulesetSillyGame extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PROTOTYPES,
			constants: {
				SKIP_MULLIGAN: true,
				FIRST_GROUP_MOVES_FIRST: true,
				ROUND_WINS_REQUIRED: 1,
			},
		})

		let correctAnswers = 0
		let roundNumber = 0

		this.createSlots()
			.addGroup({
				type: 'player',
				deck: [LeaderMaximilian],
			})
			.addGroup({
				type: 'ai',
				behaviour: AIBehaviour.DEFAULT,
				deck: [LeaderMaximilian],
			})

		const correct = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			correctAnswers++
			return rounds[++roundNumber](novel)
		}
		const incorrect = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return rounds[++roundNumber](novel)
		}

		const roundBuidler = (item: string, notNessaCorrect: boolean, response1: string, response2: string) => {
			return (novel: ServerGameNovelCreator): ServerGameNovelCreator =>
				novel
					.exec(
						`
				${item}:
				> Who would rather wear it?
				@ NotNessa
					NotNessa:
					> ${response1}
					--> ${notNessaCorrect ? 'correct' : 'incorrect'}
				@ NotMaya
					NotNessa:
					> ${response2}
					--> ${!notNessaCorrect ? 'correct' : 'incorrect'}
			`
					)
					.continue('correct', correct)
					.continue('incorrect', incorrect)
		}

		const rounds = [
			roundBuidler('Top', false, 'No, not really.', 'Correct.'),
			roundBuidler('Hoodie', true, 'Correct.', 'Probably wrong.'),
			(novel: ServerGameNovelCreator) => {
				return novel
					.exec(
						`
				Skirt:
				> Who would rather wear it?
				@ NotNessa
					NotNessa:
					> Obnoxious. I love it.
					--> correct
				@ NotMaya
					NotMaya:
					> Excuse me, but how dare you to event suggest that I would wear that?
						> Ridicolous, do you even think before answering?
						> I'll let it go through this time, but next time be more careful.
					--> incorrect
				`
					)
					.continue('correct', correct)
					.continue('incorrect', incorrect)
			},
			roundBuidler('TShirt', false, 'My arms are too short for it.', 'More prorable, than other way around.'),
			(novel: ServerGameNovelCreator) => {
				return novel
					.exec(
						`
				Dryad:
				> Who would wear rather similar costume?
				@ NotNessa
					NotNessa:
					> Correct, as back legs.
				@ NotMaya
					NotNessa:
					> Correct, as front legs.
				--> correct
				`
					)
					.continue('correct', correct)
			},
			roundBuidler('Dress', false, 'Too long for me.', 'Absolutely.'),
			(novel: ServerGameNovelCreator) => {
				return novel
					.exec(
						`
				WeddingDress:
				> Who would rather wear it?
				@ NotMaya
					NotNessa:
					> Yes, she will wear it.
					> ...
					> ......
					> Sorry, I got dreamy imagining her in that dress.
					> Do you think this train size considered chapel or something bigger?
					> Anyway, let's continue our game
				--> correct
					`
					)
					.continue('correct', correct)
			},
			roundBuidler('Coat', true, 'Mmmmm, yellow.', "Maybe? I don' really know."),
			roundBuidler('MaidDress', false, "I wasn't allowed to wear that, so there's that.", 'And she looks most lovely in it!'),
			(novel: ServerGameNovelCreator): ServerGameNovelCreator => {
				if (correctAnswers === 9) {
					return novel
						.exec(
							`
						NotNessa:
						> You win
						> Have you found all easter eggs?
						@ Yes
							NotNessa:
							> Thanks for playing!
							> P.S. I love you. <3
						@ No -> restart
					`
						)
						.continue('restart', (novel: ServerGameNovelCreator) => {
							roundNumber = 0
							correctAnswers = 0
							return rounds[0](novel)
						})
				} else {
					return novel
						.exec(
							`
						NotNessa:
						> Unfortunately you didn't answer everything correctly.
							> Wanna try again?
						@ Yes
						@ Very yes
						--> restart
					`
						)
						.continue('restart', (novel: ServerGameNovelCreator) => {
							roundNumber = 0
							correctAnswers = 0
							return rounds[0](novel)
						})
				}
			},
		]

		const rules = (novel: ServerGameNovelCreator): ServerGameNovelCreator => {
			return novel
				.exec(
					`
				NotNessa:
				> The rules are simple:
					> - Every round you will be given piece of clothing and need to guess who you think would like to wear it more: NotNessa or NotMaya.
				> Let's start the game!
				@ Let's. -> firstRound
				@ Uhhhhm.
					NotNessa:
					> What?
					@ I expected some card game.
						NotNessa:
						> Too bad, I was asked to test novel system. Have a crush. Neeeeext!
						--> 
				@ Can you explain the rules again?
					--> rules
			`
				)
				.continue('rules', rules)
				.continue('firstRound', rounds[0])
		}

		this.createCallback(GameEventType.GAME_STARTED)
			.require(({ group }) => group.isHuman)
			.startDialog(
				`
				NotNessa:
				> Hello and welcome to our game!
				--> rules
			`
			)
			.continue('rules', rules)
	}
}
