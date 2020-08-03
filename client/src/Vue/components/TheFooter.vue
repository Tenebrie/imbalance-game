<template>
	<div class="the-footer">
		<div class="info"><b>Contact:</b> notgwent@tenebrie.com • <b>Version:</b> v1.7 (04.08.2020)</div>
	</div>
</template>

<script lang="ts" />

<style scoped lang="scss">
	.the-footer {
		position: absolute;
		bottom: 0;
		width: 100%;
		color: #2c3e50;

		.info {
			padding: 4px 8px;
			text-align: end;
		}

		@media only screen and (max-width: 1900px) {
			display: none;
		}
	}
</style>
