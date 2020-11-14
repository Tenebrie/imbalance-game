/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		INSERT INTO players(id, email, username, "passwordHash", "accessLevel")
		VALUES ('00000000-aaaa-4abc-aaaa-000000000000',
		        'admin@localhost',
		        'admin#0000',
		        '$2b$04$GOu0.XpOUCiN/Jc8ud2qfO4t6p0lowTcyiTtkb1.1jveT0wUw9oyW',
		        'admin')
    `)
}

exports.down = (pgm) => {
	pgm.db.query(`
		DELETE FROM players WHERE id = '00000000-aaaa-4abc-aaaa-000000000000'
	`)
}
