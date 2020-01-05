/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.createType('gender_t', ['male', 'female', 'other'])
	pgm.addColumns('players', {
		gender: {
			type: 'gender_t',
			notNull: true,
			default: 'other'
		}
	})
}

exports.down = (pgm) => {
	pgm.dropType('gender_t')
	pgm.dropColumn('players', 'gender')
}
