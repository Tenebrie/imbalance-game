import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

import UnitChallengeDummyVanillaWarrior from '../../10-challenge/ai-00-dummy/UnitChallengeDummyVanillaWarrior'

export default class UnitRitesTargetDummy extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.RITES,
			sharedArtwork: UnitChallengeDummyVanillaWarrior,
		})
	}
}
