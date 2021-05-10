import OwnedCard from './OwnedCard'
import CardTarget from './CardTarget'
import TargetMode from '../enums/TargetMode'

export default interface ResolveStackEntry {
	targetMode: TargetMode
	ownedCard: OwnedCard
	previousTargets: {
		target: CardTarget
	}[]
}
