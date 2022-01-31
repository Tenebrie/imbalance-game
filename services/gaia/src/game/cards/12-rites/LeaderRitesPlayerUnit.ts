import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import { getLeaderTextVariables } from '@src/utils/Utils'

export default class LeaderRitesPlayerUnit extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 25,
			},
			expansionSet: ExpansionSet.RITES,
		})
		this.dynamicTextVariables = {
			...getLeaderTextVariables(this),
		}

		this.createLocalization({
			en: {
				name: '<if inGame><c=black>*{playerName}*</c></if><ifn inGame>The Adventurer</if>',
				title: '<if inGame>The Adventurer</if>',
				description: '<i>Keep yourself alive!</i>',
			},
		})
	}
}
