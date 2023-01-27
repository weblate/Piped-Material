<template>
    <v-progress-linear indeterminate />
</template>

<script>
export default {
	name: 'NewChannelRedirect',
	mounted () {
		const { channelId } = this.$route.params
		if (channelId.length === 0) {
			this.$router.replace('/')
		}
		this.$router.replace('/c/@' + channelId)
	}
}
</script>
