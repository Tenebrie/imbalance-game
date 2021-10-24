/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		UPDATE players SET "userLanguage" = 'en' WHERE "userLanguage" != 'en';
	`)
}

exports.down = () => {
	/* Empty */
}
