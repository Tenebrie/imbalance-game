import Constants from '@shared/Constants'
import AIBehaviour from '@shared/enums/AIBehaviour'
import CustomDeckRules from '@shared/enums/CustomDeckRules'
import GameMode from '@shared/enums/GameMode'
import RulesetCategory from '@shared/enums/RulesetCategory'
import GwentAleOfTheAncestors from '@src/game/cards/14-gwent/neutral/golden/GwentAleOfTheAncestors'
import GwentGeraltOfRivia from '@src/game/cards/14-gwent/neutral/golden/GwentGeraltOfRivia'
import GwentRoach from '@src/game/cards/14-gwent/neutral/silver/GwentRoach'
import GwentDwarvenAgitator from '@src/game/cards/14-gwent/scoiatael/bronze/GwentDwarvenAgitator'
import GwentDwarvenSkirmisher from '@src/game/cards/14-gwent/scoiatael/bronze/GwentDwarvenSkirmisher'
import GwentMahakamDefender from '@src/game/cards/14-gwent/scoiatael/bronze/GwentMahakamDefender'
import GwentMahakamGuard from '@src/game/cards/14-gwent/scoiatael/bronze/GwentMahakamGuard'
import GwentMahakamVolunteers from '@src/game/cards/14-gwent/scoiatael/bronze/GwentMahakamVolunteers'
import GwentSaesenthessis from '@src/game/cards/14-gwent/scoiatael/golden/GwentSaesenthessis'
import GwentXavierMoran from '@src/game/cards/14-gwent/scoiatael/golden/GwentXavierMoran'
import GwentBrouverHoog from '@src/game/cards/14-gwent/scoiatael/leader/GwentBrouverHoog'
import GwentBarclayEls from '@src/game/cards/14-gwent/scoiatael/silver/GwentBarclayEls'
import GwentDennisCranmer from '@src/game/cards/14-gwent/scoiatael/silver/GwentDennisCranmer'
import GwentPaulieDahlberg from '@src/game/cards/14-gwent/scoiatael/silver/GwentPaulieDahlberg'
import GwentSheldonSkaggs from '@src/game/cards/14-gwent/scoiatael/silver/GwentSheldonSkaggs'
import GwentYarpenZigrin from '@src/game/cards/14-gwent/scoiatael/silver/GwentYarpenZigrin'
import { ServerRuleset } from '@src/game/models/rulesets/ServerRuleset'
import ServerGame from '@src/game/models/ServerGame'

export default class RulesetChallengeDwarves extends ServerRuleset {
	constructor(game: ServerGame) {
		super(game, {
			gameMode: GameMode.PVE,
			category: RulesetCategory.PVE,
			sortPriority: 0,
			constants: {
				UNIT_HAND_SIZE_PER_ROUND: 3,
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
				deck: [
					GwentBrouverHoog,

					GwentSaesenthessis,
					GwentXavierMoran,
					GwentGeraltOfRivia,
					GwentAleOfTheAncestors,

					GwentDennisCranmer,
					GwentSheldonSkaggs,
					GwentYarpenZigrin,
					GwentPaulieDahlberg,
					GwentBarclayEls,
					GwentRoach,

					{ card: GwentDwarvenSkirmisher, count: Constants.CARD_COPIES_LIMIT_BRONZE },
					{ card: GwentMahakamDefender, count: Constants.CARD_COPIES_LIMIT_BRONZE },
					{ card: GwentMahakamGuard, count: Constants.CARD_COPIES_LIMIT_BRONZE },
					{ card: GwentMahakamVolunteers, count: Constants.CARD_COPIES_LIMIT_BRONZE },
					{ card: GwentDwarvenAgitator, count: Constants.CARD_COPIES_LIMIT_BRONZE },
				],
			})
	}
}
