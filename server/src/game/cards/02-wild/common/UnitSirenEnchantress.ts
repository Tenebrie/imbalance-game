import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import ServerBoardRow from '@src/game/models/ServerBoardRow'
import TargetType from '@src/../../shared/src/enums/TargetType'
import BuffRowBloodMoon from '@src/game/buffs/BuffRowBloodMoon'
import Keywords from '@src/utils/Keywords'

export default class UnitSirenEnchantress extends ServerCard {
	public static readonly INFUSE_COST = 2

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.WILD,
			tribes: [CardTribe.MERFOLK],
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_INFUSE_X, CardFeature.KEYWORD_BUFF_ROW_BLOOD_MOON],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			cost: UnitSirenEnchantress.INFUSE_COST,
		}

		this.createDeployTargets(TargetType.BOARD_ROW)
			.require(() => this.ownerPlayer.spellMana >= UnitSirenEnchantress.INFUSE_COST)
			.require(({ targetRow }) => targetRow.owner === this.ownerPlayerNullable)
			.perform(({ targetRow }) => onTargetSelected(targetRow))

		const onTargetSelected = (target: ServerBoardRow): void => {
			Keywords.infuse(this, UnitSirenEnchantress.INFUSE_COST)
			target.buffs.add(BuffRowBloodMoon, this)
		}
	}
}
