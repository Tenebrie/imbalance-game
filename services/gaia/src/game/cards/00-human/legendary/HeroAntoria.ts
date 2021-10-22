import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardLocation from '@shared/enums/CardLocation'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import DamageSource from '@shared/enums/DamageSource'
import ExpansionSet from '@shared/enums/ExpansionSet'
import GameEventType from '@shared/enums/GameEventType'
import BuffProtector from '@src/game/buffs/BuffProtector'

import GameHookType from '../../../models/events/GameHookType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class HeroAntoria extends ServerCard {
	private damageIntercepted = false

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.VALKYRIE],
			features: [CardFeature.PROMINENT],
			stats: {
				power: 14,
				armor: 8,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.buffs.add(BuffProtector, this)
		this.dynamicTextVariables = {
			inGame: () => !!this.ownerGroupNullable,
			isActive: () => !this.damageIntercepted,
		}

		this.createLocalization({
			en: {
				name: 'Antoria',
				title: 'The Martyr',
				description:
					'The first time an ally is attacked while this is in your hand, intercept the damage.' +
					'<if inGame><p><i><if isActive><c gold>Card effect ready!</c></if><ifn isActive>Card effect used.</ifn></i>',
			},
		})

		this.createHook(GameHookType.CARD_TAKES_DAMAGE, [CardLocation.HAND])
			.require(() => !this.damageIntercepted)
			.require((_, { targetCard }) => targetCard.location === CardLocation.BOARD)
			.require((_, { targetCard }) => targetCard.ownerGroup === this.ownerGroup)
			.require(
				(_, { targetCard, damageInstance }) =>
					damageInstance.source === DamageSource.CARD && damageInstance.sourceCard.ownerGroup !== targetCard.ownerGroup
			)
			.replace((values) => ({
				...values,
				targetCard: this,
			}))
			.perform(() => {
				this.damageIntercepted = true
			})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => {
			this.damageIntercepted = false
		})
	}
}
