<template>
    <v-progress-linear indeterminate v-if="!loaded" />
    <v-card v-else>
        <v-card-title>{{ $t('playlists.add_to_playlist') }}</v-card-title>
        <v-card-text>
            <v-select
                dense
                v-model="selectedPlaylist"
                :items="playlistItems"
            />
        </v-card-text>
        <v-card-actions>
            <v-btn outlined @click="submit">{{ $t('playlists.confirm_addition') }}</v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
export default {
	name: 'VideoPlaylistOperationsA',
	props: ['videoId'],
	data: () => ({
		loaded: false,
		selectedPlaylist: null,
		playlistItems: {}
	}),
	async mounted () {
		this.playlistItems = (await this.$store.dispatch('auth/makeRequest', {
			method: 'GET',
			path: '/user/playlists'
		})).map(item => {
			return {
				text: item.name,
				value: item.id
			}
		})
		this.loaded = true
	},
	methods: {
		async submit () {
			await this.$store.dispatch('auth/makeRequest', {
				method: 'POST',
				path: '/user/playlists/add',
				data: {
					playlistId: this.selectedPlaylist,
					videoId: this.videoId
				}
			})
			this.$emit('input', false)
		}
	}
}
</script>
