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

export default class GwentDimeritiumShackles extends ServerCard {
	public static readonly DAMAGE = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.ALCHEMY, CardTribe.ITEM],
			stats: {
				cost: 0,
				unitCost: 1,
			},
			expansionSet: ExpansionSet.GWENT,
		})
		this.dynamicTextVariables = {
			damage: GwentDimeritiumShackles.DAMAGE,
		}

		this.createLocalization({
			en: {
				name: 'Dimeritium Shackles',
				description: "Toggle a unit's *Lock* status.\nIf an enemy, deal {damage} damage to it.",
				flavor:
					"The mage's arms were twisted and bound behind his back. The Redanians gave the fetters a good shake. Terranova cried out, lurched, bent backwards, bowed forward, then retched and groaned. It was clear of what his manacles were made.",
			},
		})

		this.createDeployTargets(TargetType.UNIT).perform(({ targetCard }) => {
			game.animation.thread(() => {
				Keywords.toggleLock({
					card: targetCard,
					source: this,
				})
			})

			game.animation.thread(() => {
				if (targetCard.ownerGroup !== this.ownerGroup) {
					targetCard.dealDamage(DamageInstance.fromCard(GwentDimeritiumShackles.DAMAGE, this))
				}
			})
			game.animation.syncAnimationThreads()
		})
	}
}
