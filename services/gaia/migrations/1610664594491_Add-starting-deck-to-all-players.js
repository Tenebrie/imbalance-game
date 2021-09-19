/* eslint-disable camelcase */

exports.shorthands = undefined

exports.up = (pgm) => {
	pgm.db.query(`
		CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	`)
	pgm.db.query(`
		INSERT INTO editor_decks(id, "playerId", name, cards)
		SELECT
			concat('deck:', uuid_generate_v4()),
			id,
			'My First Deck',
			'[{"class": "leaderMaximilian", "count": 1}, {"class": "heroTroviar", "count": 1}, {"class": "heroPozoga", "count": 1}, {"class": "heroRobert", "count": 1}, {"class": "heroAura", "count": 1}, {"class": "heroForksmanshipInstructor", "count": 2}, {"class": "heroLightOracle", "count": 2}, {"class": "unitUrbanTactician", "count": 2}, {"class": "heroCultistOfAreddon", "count": 2}, {"class": "unitBloodyTrebuchet", "count": 2}, {"class": "unitEagleEyeArcher", "count": 3}, {"class": "unitChargingKnight", "count": 3}, {"class": "unitYoungSquire", "count": 3}, {"class": "unitMasterSwordsmith", "count": 3}, {"class": "unitRavenMessenger", "count": 3}, {"class": "unitWoodenPalisade", "count": 3}, {"class": "unitArcheryTower", "count": 3}]'
		FROM players;
    `)
}

exports.down = (pgm) => {
	pgm.db.query(`
		DROP EXTENSION "uuid-ossp";
	`)
	pgm.db.query(`
		DELETE FROM editor_decks
		WHERE
		      name = 'My First Deck' AND
		      cards = '[{"class": "leaderMaximilian", "count": 1}, {"class": "heroTroviar", "count": 1}, {"class": "heroPozoga", "count": 1}, {"class": "heroRobert", "count": 1}, {"class": "heroAura", "count": 1}, {"class": "heroForksmanshipInstructor", "count": 2}, {"class": "heroLightOracle", "count": 2}, {"class": "unitUrbanTactician", "count": 2}, {"class": "heroCultistOfAreddon", "count": 2}, {"class": "unitBloodyTrebuchet", "count": 2}, {"class": "unitEagleEyeArcher", "count": 3}, {"class": "unitChargingKnight", "count": 3}, {"class": "unitYoungSquire", "count": 3}, {"class": "unitMasterSwordsmith", "count": 3}, {"class": "unitRavenMessenger", "count": 3}, {"class": "unitWoodenPalisade", "count": 3}, {"class": "unitArcheryTower", "count": 3}]'
		;
	`)
}
