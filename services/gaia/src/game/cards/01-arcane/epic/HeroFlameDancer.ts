import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import { asSplashEffectDuration } from '@src/utils/LeaderStats'

import BuffRowBurning from '../../../buffs/BuffRowBurning'
import ServerBoardRow from '../../../models/ServerBoardRow'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroFlameDancer extends ServerCard {
	burnDuration = asSplashEffectDuration(9)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_BUFF_ROW_BURNING],
			generatedArtworkMagicString: '2',
			stats: {
				power: 10,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			burnDuration: this.burnDuration,
		}

		this.createDeployTargets(TargetType.BOARD_ROW)
			.requireEnemy()
			.perform(({ targetRow }) => onTargetSelected(targetRow))

		const onTargetSelected = (target: ServerBoardRow): void => {
			target.buffs.add(BuffRowBurning, this)
		}
	}
}
