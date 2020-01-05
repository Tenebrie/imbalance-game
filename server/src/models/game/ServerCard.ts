import uuidv4 from 'uuid/v4'
import { Card } from '../../../../common/Card'

export default class ServerCard extends Card {
	constructor(cardClass: string) {
		super(uuidv4(), cardClass)
	}

	static newInstance(cardClass: string): ServerCard {
		return new ServerCard(cardClass)
	}
}
