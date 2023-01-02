<template>
    <v-progress-linear height="1vh" indeterminate v-if="loaded === false"/>
    <v-container fluid v-else>
        <v-row align="center">
            <v-col md="auto">
                <v-btn outlined @click="deleteWatchHistory" x-large>Delete History</v-btn>
            </v-col>
            <v-col md="auto">
                <v-switch dense label="Only display videos not completely finished" v-model="unfinishedVideosSwitch"/>
            </v-col>
        </v-row>
        <v-row v-for="(chunk, chunkId) in chunkedByFour" :key="chunkId">
            <v-col md="3" v-for="doc in chunk" :key="doc._id">
                <VideoItem :video="doc.video" :src-progress="doc.progressPcnt" max-height>
                    <template v-slot:top>
                        <ExpandableDate message-key="misc.watchedAgo"
                                        :message-arguments="{ p: timeFormat(doc.progress) }" :date="doc.timestamp"/>
                        <br/>
                    </template>
                </VideoItem>
            </v-col>
        </v-row>
        <v-pagination v-model="currentPage" :total-visible="7" :length="pageCount" />
    </v-container>
</template>

<script>
import _chunk from 'lodash-es/chunk'

import { LibPiped } from '@/tools/libpiped'
import { deleteWatchedVideos, PMDB } from '@/store/watched-videos-db'
import VideoItem from '@/components/Video/VideoItem'
import ExpandableDate from '@/components/ExpandableDate'

const PAGE_SIZE = 50

export default {
	components: {
		ExpandableDate,
		VideoItem
	},
	data: () => ({
		loaded: false,
		data: null,
		currentPage: 1,
		pageCount: 0,
		unfinishedVideosSwitch: false
	}),

	metaInfo () {
		return {
			title: this.$t('titles.history')
		}
	},

	methods: {
		timeFormat (t) {
			return LibPiped.timeFormat(t)
		},

		async loadData () {
			if (!this.unfinishedVideosSwitch) {
				this.data = await PMDB.watchedVideos.orderBy('timestamp').reverse().offset((this.currentPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).toArray()
			} else {
				this.data = await PMDB.watchedVideos.where('progressPcnt').below(99.9).reverse().offset((this.currentPage - 1) * PAGE_SIZE).limit(PAGE_SIZE).sortBy('timestamp')
			}
			this.pageCount = Math.ceil((await PMDB.watchedVideos.count()) / PAGE_SIZE)
			this.loaded = true
		},

		async deleteWatchHistory () {
			await deleteWatchedVideos()
			await this.loadData()
		}
	},

	watch: {
		unfinishedVideosSwitch () {
			this.loadData()
		},

		currentPage () {
			this.loadData()
		}
	},

	computed: {
		chunkedByFour () {
			return _chunk(this.data, 4)
		}
	},

	mounted () {
		this.loadData().catch(e => console.error(e))
	}
}
</script>
