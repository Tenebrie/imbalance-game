/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		UPDATE shared_decks SET id = substr(id, 7) WHERE starts_with(id, 'share:');
		UPDATE editor_decks SET id = concat('deck:', substr(id, 7)) WHERE starts_with(id, 'share:');
    `)
}

exports.down = () => {
	// Empty
}
