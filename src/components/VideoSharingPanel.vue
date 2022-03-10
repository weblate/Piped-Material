<template>
    <v-card>
        <v-card-title>Share this video</v-card-title>
        <v-card-text>
            <p class="text-subtitle-1">{{ $t('video_sharing_panel.with_timestamps') }}</p>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_pm')}}
                </v-col>
                <v-col cols="8">
                    <v-text-field readonly dense :value="PMURL.withTimestamps" />
                </v-col>
            </v-row>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_yt')}}
                </v-col>
                <v-col cols="8">
                    <v-text-field readonly dense :value="youtubeURL.withTimestamps" />
                </v-col>
            </v-row>
            <v-divider class="my-1" />
            <p class="text-subtitle-1">{{ $t('video_sharing_panel.without_timestamps') }}</p>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_pm')}}
                </v-col>
                <v-col cols="8">
                    <v-text-field readonly dense :value="PMURL.base" />
                </v-col>
            </v-row>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_yt')}}
                </v-col>
                <v-col cols="8">
                    <v-text-field readonly dense :value="youtubeURL.base" />
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
export default {
	name: 'VideoSharingPanel',
	props: ['currentTime', 'videoId'],
	computed: {
		currentTimeR () {
			return Math.round(this.currentTime)
		},

		youtubeURL () {
			const base = new URL('https://youtu.be/' + this.videoId)
			const baseHref = base.href

			base.searchParams.set('t', this.currentTimeR.toString())
			return {
				base: baseHref,
				withTimestamps: base.href
			}
		},

		PMURL () {
			const base = new URL(window.location.href)
			base.pathname = '/watch'
			base.searchParams.set('v', this.videoId)
			const baseHref = base.href

			base.searchParams.set('t', this.currentTimeR.toString())
			return {
				base: baseHref,
				withTimestamps: base.href
			}
		}
	}
}
</script>
