<template>
	<div class="the-rules-list">
		<div class="rules-container">
			<h1>Game rules</h1>
			<p>
				Not Gwent (temporary name) is a 1v1 Player versus Player (or Player versus AI) card collecting game.
				Each players enters the game with a deck they build using the cards they own (see <b>Decks</b>).
				Players take turns playing cards and interacting with the board with the goal of maximizing
				the total Power of their cards. Player with the highest combined Power wins the round.
			</p>
			<p>A player wins the game after gaining 2 round wins.</p>


			<h2>Deck building</h2>
			<p>
				Every deck contains a total of 25 cards, plus 1 Leader card. Choosing a leader card also locks the
				factions this deck belongs to (currently, only Arcane leaders are available). The cards that the
				player puts into their deck are all <i>Units</i>.
			</p>
			<p>The deck must include exactly the following number of cards:</p>
			<ul>
				<li>1 Leader card</li>
				<li>4 Legendary cards</li>
				<li>6 Epic cards</li>
				<li>15 Common cards</li>
			</ul>
			<p>
				Only one copy of a Legendary or an Epic card may be included. Commons, however, may have up to 3 copies.
			</p>


			<h2>Cards & Game board</h2>
			<p>
				All cards are divided into two categories: Units and Spells. From the player's perspective, all the
				Unit cards they own are stored in their Unit hand (on the left), and Spells - in the Spell hand (on
				the right).
			</p>
			<p>
				When played, Units take space on the game board. The board is split into 6 rows, with each player
				owning 3 closest to them. Each row may hold up to 10 units. Row positioning is important to some of
				the card effects.
			</p>
			<p>
				Units have a certain Power value, represented by the number in the top left corner of the card. This
				is the value that is used to determine the total Power on the board at the end of the round. The
				card's Power may change during the course of the game by the means of taking damage, healing or
				applying status effects (buffs) to the card.
			</p>
			<p>
				Spells, on the other hand, are resolved immediately after being played and go into graveyard. Spells
				also require some Mana to play, represented by the number in the top left corner of the card. Player
				has 10 Mana to spend during the round, and some cards may generate more Mana.
			</p>
			<p>
				Generally, player's spell hand contains a number of Leader Powers, determined by the leader selected.
				Unlike other spells, Leader Powers will return to the player's hand at the start of the next turn
				when used.
			</p>
			<p>
				Most cards in the game also have certain effects, described by their text. <b>Deploy</b> effects are
				the most common, and those are resolved as soon as the card is played onto the board.
			</p>


			<h2>Player's turn</h2>
			<p>During their turn, a player must either:</p>
			<ul>
				<li>Play exactly one card from their unit hand</li>
				<li>Finish their round</li>
			</ul>
			<p>
				When a player finishes their round, their opponent is still free to continue playing cards as long as
				they have cards to play. The winner of the round is determined when both players finish their round.
			</p>
			<p>
				On top of the basic action, player may also do the following during their turn:
			</p>
			<ul>
				<li>Play any cards that have been <b>Summoned</b></li>
				<li>Play spell cards as long as they have mana to pay the cost</li>
				<li>Issue orders to cards on the board that have <b>Attack</b> or <b>Support</b> keywords</li>
			</ul>

			<h2>Footnotes</h2>
			<p>
				In the current version, players have access to all available cards.
			</p>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({})
</script>

<style scoped lang="scss">
	@import "../../styles/generic";

	.the-rules-list {

		.rules-container {
			width: calc(100% - 64px);
			height: 100%;
			padding: 32px;
			overflow-y: scroll;

			p {
				text-indent: 2em;
				text-align: left;
				line-height: 1.5em;
			}
			ul {
				padding-left: 4em;
				line-height: 1.5em;
				text-align: left;
			}
		}
	}
</style>
