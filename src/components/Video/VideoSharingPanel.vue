<template>
    <v-card>
        <v-card-title>{{ $t('video_sharing_panel.title' )}}</v-card-title>
        <v-card-text>
            <p class="text-subtitle-1">{{ $t('video_sharing_panel.with_timestamps') }}</p>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_pm')}}
                </v-col>
                <v-col :cols="columnsForTxt">
                    <v-text-field readonly dense :value="PMURL.withTimestamps" />
                </v-col>
                <v-col cols="2" v-if="isShareable" @click="systemShare(PMURL.withTimestamps)">
                    <v-btn icon class="ml-2 mb-2" :alt="$t('video_sharing_panel.share_system')" >
                        <v-icon>{{ mdiShareVariantOutline }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_yt')}}
                </v-col>
                <v-col :cols="columnsForTxt">
                    <v-text-field readonly dense :value="youtubeURL.withTimestamps" />
                </v-col>
                <v-col cols="2" v-if="isShareable" @click="systemShare(youtubeURL.withTimestamps)">
                    <v-btn icon class="ml-2 mb-2" :alt="$t('video_sharing_panel.share_system')" >
                        <v-icon>{{ mdiShareVariantOutline }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-divider class="my-1" />
            <p class="text-subtitle-1">{{ $t('video_sharing_panel.without_timestamps') }}</p>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_pm')}}
                </v-col>
                <v-col :cols="columnsForTxt">
                    <v-text-field readonly dense :value="PMURL.base" />
                </v-col>
                <v-col cols="2" v-if="isShareable" @click="systemShare(PMURL.base)">
                    <v-btn icon class="ml-2 mb-2" :alt="$t('video_sharing_panel.share_system')" >
                        <v-icon>{{ mdiShareVariantOutline }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
            <v-row align="center" no-gutters>
                <v-col cols="4">
                    {{ $t('video_sharing_panel.via_yt')}}
                </v-col>
                <v-col :cols="columnsForTxt">
                    <v-text-field readonly dense :value="youtubeURL.base" />
                </v-col>
                <v-col cols="2" v-if="isShareable" @click="systemShare(youtubeURL.base)">
                    <v-btn icon class="ml-2 mb-2" :alt="$t('video_sharing_panel.share_system')" >
                        <v-icon>{{ mdiShareVariantOutline }}</v-icon>
                    </v-btn>
                </v-col>
            </v-row>
        </v-card-text>
    </v-card>
</template>

<script>
import { mdiShareVariantOutline } from '@mdi/js'

export default {
	name: 'VideoSharingPanel',
	props: ['currentTime', 'videoId'],
	data: () => ({
		mdiShareVariantOutline
	}),
	computed: {
		isShareable () {
			return navigator.canShare ? navigator.canShare({ url: this.youtubeURL }) : false
		},

		columnsForTxt () {
			return this.isShareable ? 6 : 8
		},

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
	},
	methods: {
		systemShare (url) {
			return navigator.share({ url })
		}
	}
}
</script>
