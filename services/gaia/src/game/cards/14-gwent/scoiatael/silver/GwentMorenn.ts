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
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentMorenn extends ServerCard {
	public static readonly DAMAGE = 7

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.SILVER,
			faction: CardFaction.SCOIATAEL,
			features: [CardFeature.AMBUSH],
			tribes: [CardTribe.DRYAD],
			stats: {
				power: 8,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Morenn`,
				description: `*Ambush*: When a unit is played on your opponent's side, flip over and deal *${GwentMorenn.DAMAGE}* damage to it.`,
				flavor: `Lady Eithné's daughter had inherited her sublime beauty and her wild hatred for all that is human.`,
			},
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.buffs.add(BuffGwentAmbush, this)
		})

		this.createCallback(GameEventType.CARD_PLAYED, [CardLocation.BOARD])
			.requireImmediate(() => this.isAmbush)
			.require(({ triggeringCard }) => triggeringCard.type === CardType.UNIT)
			.require(({ triggeringCard }) => !triggeringCard.features.includes(CardFeature.UNSPLASHABLE))
			.require(({ owner }) => !owner.group.owns(this))
			.perform(({ triggeringCard }) => {
				Keywords.revealCard(this)
				triggeringCard.dealDamage(DamageInstance.fromCard(GwentMorenn.DAMAGE, this))
			})
	}
}
