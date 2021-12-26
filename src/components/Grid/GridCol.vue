<template>
    <div :class="colClass">
        <slot />
    </div>
</template>

<script>
export default {
	name: 'GridCol',
	computed: {
		colClass () {
			if (this.$vuetify.breakpoint.smAndDown) {
				return []
			}
			const colClass = this.$store.getters['prefs/getPreferenceNumber']('feedColumns', 4)
			return ['grid-col', 'grid-col-' + (60 / colClass)]
		}
	}
}
</script>
