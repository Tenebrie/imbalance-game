<template>
	<div class="register">
		<the-register-form />
	</div>
</template>

<script lang="ts">
import Vue from 'vue'
import TheRegisterForm from '../components/login/TheRegisterForm.vue'

export default Vue.extend({
	components: { TheRegisterForm },

	computed: {},
})
</script>
