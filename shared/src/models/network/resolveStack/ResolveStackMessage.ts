import ResolveStack from '../../ResolveStack'
import ResolveStackEntryMessage from './ResolveStackEntryMessage'

export default class ResolveStackMessage {
	entries: ResolveStackEntryMessage[]

	constructor(resolveStack: ResolveStack) {
		this.entries = resolveStack.entries.map((entry) => new ResolveStackEntryMessage(entry))
	}
}
