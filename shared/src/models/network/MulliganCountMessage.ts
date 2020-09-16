export default class MulliganCountMessage {
	usedMulligans: number
	maxMulligans: number

	constructor(usedMulligans: number, maxMulligans: number) {
		this.usedMulligans = usedMulligans
		this.maxMulligans = maxMulligans
	}
}
