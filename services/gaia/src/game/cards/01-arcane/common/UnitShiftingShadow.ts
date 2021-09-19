import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import CardFeature from '@shared/enums/CardFeature'
import CardType from '@shared/enums/CardType'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'
import UnitFierceShadow from '@src/game/cards/01-arcane/tokens/UnitFierceShadow'
import ServerUnit from '@src/game/models/ServerUnit'

import Keywords from '../../../../utils/Keywords'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'

export default class UnitShiftingShadow extends ServerCard {
	selectedAlly: ServerUnit | null = null
	selectedAllyRowIndex: number | null = null
	selectedAllyUnitIndex: number | null = null

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.ARCANE,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_SUMMON],
			relatedCards: [UnitFierceShadow],
			stats: {
				power: 12,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createLocalization({
			en: {
				name: 'Shifting Shadow',
				description: '*Deploy*:<br>*Move* an allied unit.<p>*Summon* a *Fierce Shadow* at the old position.',
			},
		})

		this.createDeployTargets(TargetType.UNIT)
			.requireAllied()
			.requireNotSelf()
			.requireNull(() => this.selectedAlly)
			.perform(({ targetUnit }) => {
				this.selectedAlly = targetUnit
				this.selectedAllyRowIndex = targetUnit.rowIndex
				this.selectedAllyUnitIndex = targetUnit.unitIndex
			})
			.label('card.spellTacticalMove.target.label.unit')

		this.createDeployTargets(TargetType.BOARD_POSITION)
			.requireAllied()
			.requireNotNull(() => this.selectedAlly)
			.require(({ targetRow }) => targetRow.index !== this.selectedAlly!.rowIndex)
			.perform(({ targetRow, targetPosition }) => {
				Keywords.moveUnit(this.selectedAlly!, targetRow.index, targetPosition)
			})
			.perform(() => {
				Keywords.summonUnit({
					owner: this.ownerPlayer,
					cardConstructor: UnitFierceShadow,
					rowIndex: this.selectedAllyRowIndex!,
					unitIndex: this.selectedAllyUnitIndex!,
				})
			})
			.finalize(() => {
				this.selectedAlly = null
				this.selectedAllyRowIndex = null
				this.selectedAllyUnitIndex = null
			})
			.label('card.spellTacticalMove.target.label.row')
	}
}
