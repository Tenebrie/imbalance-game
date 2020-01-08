<template>
	<div id="app">
		<router-view/>
	</div>
</template>

<style lang="scss">
body {
	overflow-y: hidden;
	height: 100vh;
	padding: 0;
	margin: 0;
}

#app {
	font-family: 'Avenir', Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {

	a {
		font-weight: bold;
		color: #2c3e50;

		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
