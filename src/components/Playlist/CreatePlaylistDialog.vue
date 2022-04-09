<template>
    <v-dialog
            v-model="dialogOpen"
            width="768"
    >
        <template v-slot:activator="{ on, attrs }">
            <v-btn
                    outlined
                    v-bind="attrs"
                    v-on="on"
            >
                {{ $t('playlists.create_playlist') }}
            </v-btn>
        </template>

        <v-card>
            <v-card-text>
                <form @submit.prevent="createPlaylist">
                    <v-text-field full-width v-model="playlistName" :label="$t('playlists.playlist_field_name')" />
                    <v-btn type="submit" :loading="loading" :disabled="loading" outlined>
                        {{ $t('playlists.create_playlist') }}
                    </v-btn>
                </form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
	name: 'CreatePlaylistDialog',
	data: () => ({
		dialogOpen: false,
		loading: false,
		playlistName: ''
	}),
	methods: {
		async createPlaylist () {
			this.loading = true
			await this.$store.dispatch('auth/makeRequest', {
				method: 'POST',
				path: '/user/playlists/create',
				data: {
					name: this.playlistName
				}
			})
			this.loading = false
			this.dialogOpen = false
			this.$emit('created')
		}
	}
}
</script>
