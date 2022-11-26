<template>
    <v-dialog max-width="720" :value="dialogOpen" @input="$emit('input', $event)">
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
                <v-btn class="mr-1" outlined @click="submit">{{ $t('playlists.confirm_addition') }}</v-btn>
                <CreatePlaylistDialog @created="loadPlaylists" />
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import CreatePlaylistDialog from '@/components/Playlist/CreatePlaylistDialog'

export default {
	name: 'VideoPlaylistOperationsA',
	components: {
		CreatePlaylistDialog
	},
	props: ['videoId', 'dialogOpen'],
	data: () => ({
		loaded: false,
		selectedPlaylist: null,
		playlistItems: {}
	}),
	mounted () {
		return this.loadPlaylists()
	},
	watch: {
		dialogOpen (next) {
			if (next === true) {
				this.loadPlaylists()
			}
		}
	},
	methods: {
		async loadPlaylists () {
			if (!this.$store.getters['auth/isCurrentlyAuthenticated']) {
				return
			}
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
