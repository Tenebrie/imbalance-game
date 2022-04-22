import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffGwentAmbush from '@src/game/buffs/14-gwent/BuffGwentAmbush'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentVriheddSappers extends ServerCard {
	public static readonly TURNS_TO_WAIT = 2
	private turnsCounted = 0

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.SCOIATAEL,
			tribes: [CardTribe.SOLDIER, CardTribe.ELF],
			features: [CardFeature.AMBUSH],
			stats: {
				power: 11,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Vrihedd Sappers`,
				description: `*Ambush*: After *${GwentVriheddSappers.TURNS_TO_WAIT}* turns, flip over on turn start.`,
				flavor: `No matter what you may have heard, elves don't take human scalps. Too much lice.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffGwentAmbush, this)
		})

		this.createCallback(GameEventType.TURN_STARTED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(() => {
				this.turnsCounted += 1
				if (this.turnsCounted !== GwentVriheddSappers.TURNS_TO_WAIT) {
					return
				}

				Keywords.revealCard(this)
			})
	}
}
