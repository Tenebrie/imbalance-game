import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import BuffStrength from '@src/game/buffs/BuffStrength'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'

export default class GwentEkimarra extends ServerCard {
	private static readonly DAMAGE = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.MONSTER,
			tribes: [CardTribe.VAMPIRE],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentEkimarra.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Ekimarra',
				description: '*Drain* a unit by {damage}.',
				flavor: 'Who would think that overgrown bats would have a taste for gaudy jewelry?',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireNotSelf()
			.perform(({ targetUnit }) => {
				targetUnit.dealDamage(DamageInstance.fromCard(GwentEkimarra.DAMAGE, this))
				this.buffs.addMultiple(BuffStrength, GwentEkimarra.DAMAGE, this)
			})
	}
}