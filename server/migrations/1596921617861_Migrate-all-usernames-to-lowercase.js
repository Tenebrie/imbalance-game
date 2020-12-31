/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query('UPDATE players SET email=lower(email)')
}

exports.down = () => {
	/* Empty */
}
