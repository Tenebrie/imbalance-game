import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import { getAllHighestUnits } from '@src/utils/Utils'

export default class GwentYenneferConjurer extends ServerCard {
	public static readonly DAMAGE = 1

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.MAGE, CardTribe.AEDIRN],
			stats: {
				power: 10,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Yennefer: Conjurer`,
				description: `Deal *${GwentYenneferConjurer.DAMAGE}* damage to the *Highest* enemies on turn end.`,
				flavor: `A good sorceress must know when to conjure ice… and when to conjure fire.`,
			},
		})

		this.createCallback(GameEventType.TURN_ENDED, [CardLocation.BOARD])
			.require(({ group }) => group.owns(this))
			.perform(({ group }) => {
				const opponentUnits = game.board.getSplashableUnitsForOpponentOf(group)
				const targets = getAllHighestUnits(opponentUnits)
				targets.forEach((target) => {
					target.dealDamage(DamageInstance.fromCard(GwentYenneferConjurer.DAMAGE, this), 'stagger')
				})
			})
	}
}
