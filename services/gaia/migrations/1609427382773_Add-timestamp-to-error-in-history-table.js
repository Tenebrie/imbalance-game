/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		ALTER TABLE error_in_game_history ADD COLUMN "createdAt" TIMESTAMP DEFAULT current_timestamp; 
    `)
}

exports.down = (pgm) => {
	pgm.db.query(`
		ALTER TABLE error_in_game_history DROP COLUMN "createdAt";
	`)
}
