import ResolveStackEntry from '../../ResolveStackEntry'
import CardTargetMessage from '../CardTargetMessage'
import OpenOwnedCardMessage from '../ownedCard/OpenOwnedCardMessage'
import OwnedCardMessage from '../ownedCard/OwnedCardMessage'

export default class ResolveStackEntryMessage {
	ownedCard: OwnedCardMessage
	targetsSelected: CardTargetMessage[]

	constructor(entry: ResolveStackEntry) {
		this.ownedCard = new OpenOwnedCardMessage(entry.ownedCard)
		this.targetsSelected = entry.previousTargets.map((target) => new CardTargetMessage(target.target))
	}
}
