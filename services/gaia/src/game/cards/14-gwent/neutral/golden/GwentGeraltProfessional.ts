import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardTribe from '@shared/enums/CardTribe'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import ServerCard from '@src/game/models/ServerCard'
import { DamageInstance } from '@src/game/models/ServerDamageSource'
import ServerGame from '@src/game/models/ServerGame'
import Keywords from '@src/utils/Keywords'

export default class GwentGeraltProfessional extends ServerCard {
	public static readonly DAMAGE = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.WITCHER],
			stats: {
				power: 7,
				armor: 0,
			},
			expansionSet: ExpansionSet.GWENT,
		})

		this.createLocalization({
			en: {
				name: `Geralt: Professional`,
				description: `Deal *${GwentGeraltProfessional.DAMAGE}* damage to an enemy. If it's a Monster faction unit, destroy it instead.`,
				flavor: `I accepted a job once, did it. Asked to choose my reward, I invoked the Law of Surprise.`,
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireEnemy()
			.perform(({ targetUnit }) => {
				if (targetUnit.card.faction === CardFaction.MONSTER) {
					Keywords.destroyUnit({
						unit: targetUnit,
						source: this,
					})
				} else {
					targetUnit.dealDamage(DamageInstance.fromCard(GwentGeraltProfessional.DAMAGE, this))
				}
			})
	}
}
