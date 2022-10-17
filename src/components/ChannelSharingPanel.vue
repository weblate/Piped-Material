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
                <v-row align="center" no-gutters>
                    <v-col cols="4">
                        {{ $t('channel_sharing_panel.via_pm')}}
                    </v-col>
                    <v-col cols="8">
                        <v-text-field readonly dense :value="viaPM" />
                    </v-col>
                </v-row>
                <v-row align="center" no-gutters>
                    <v-col cols="4">
                        {{ $t('channel_sharing_panel.via_yt')}}
                    </v-col>
                    <v-col cols="8">
                        <v-text-field readonly dense :value="viaYT" />
                    </v-col>
                </v-row>
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
		viaPM () {
			const u = new URL(window.location.href)
			for (const k of u.searchParams.keys()) {
				u.searchParams.delete(k)
			}
			u.hash = ''
			u.pathname = '/channel/' + this.channelId
			return u.href
		},

		viaYT () {
			return 'https://youtube.com/channel/' + this.channelId
		}
	}
}
</script>
