<template>
    <v-dialog v-model="dialogOpen" width="720">
        <template v-slot:activator="{ on, attrs }">
            <v-btn outlined class="ml-2" color="primary" v-bind="attrs" v-on="on">
                {{ $t('channel_sharing_panel.share') }}
            </v-btn>
        </template>
        <v-card>
            <v-card-title>
                {{ $t('channel_sharing_panel.title') }}
            </v-card-title>
            <v-card-text>
                <v-text-field readonly :value="value" />
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
	name: 'ChannelSharingPanel',
	props: ['channelId'],
	data: () => ({
		dialogOpen: false
	}),
	computed: {
		value () {
			const u = new URL(window.location.href)
			for (const k of u.searchParams.keys()) {
				u.searchParams.delete(k)
			}
			u.hash = ''
			u.pathname = '/channel/' + this.channelId
			return u.href
		}
	}
}
</script>
