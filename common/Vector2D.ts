export default class Vector2D {
	x: number
	y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}

	public static empty() {
		return new Vector2D(0, 0)
	}
}
