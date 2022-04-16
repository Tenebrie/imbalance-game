import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffPermanentImmunity from '@src/game/buffs/BuffPermanentImmunity'
import Keywords from '@src/utils/Keywords'
import { getLeaderTextVariables } from '@src/utils/Utils'

import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'

export default class GwentArachasQueen extends ServerCard {
	public static readonly TARGETS = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID],
			stats: {
				power: 7,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			targets: GwentArachasQueen.TARGETS,
			...getLeaderTextVariables(this),
		}
		this.buffs.add(BuffPermanentImmunity, this)

		this.createLocalization({
			en: {
				name: '<if inGame>{playerName}</if><ifn inGame>Arachas Queen</if>',
				title: '<if inGame>as Arachas Queen</if>',
				listName: 'Arachas Queen',
				description: '*Immune*<p>*Consume* {targets} allies and boost self by their power.',
				flavor: 'That is not dead which can eternal lie, and with strange aeons even death may die.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.targetCount(GwentArachasQueen.TARGETS)
			.perform(({ targetUnit }) => {
				Keywords.consume.units({
					targets: [targetUnit],
					consumer: this,
				})
			})
	}
}
