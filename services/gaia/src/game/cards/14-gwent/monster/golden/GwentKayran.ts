import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentKayran extends ServerCard {
	public static readonly MAX_CONSUME_POWER = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.INSECTOID],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			maxPower: GwentKayran.MAX_CONSUME_POWER,
		}

		this.createLocalization({
			en: {
				name: 'Kayran',
				description: '*Consume* a unit with {maxPower} power or less and boost self by its power.',
				flavor: 'How to kill a kayran? Simple! Take your best sword… then sell it, and hire a witcher.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.require(({ targetCard }) => targetCard.stats.power <= GwentKayran.MAX_CONSUME_POWER)
			.perform(({ targetUnit }) => {
				Keywords.consume.units({
					targets: [targetUnit],
					consumer: this,
				})
			})
	}
}
