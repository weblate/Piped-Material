<template>
  <v-progress-linear height="1vh" indeterminate v-if="loaded === false" />
  <v-container fluid v-else>
    <v-row align="center">
      <v-col md="auto">
        <v-btn outlined @click="deleteWatchHistory" x-large>Delete History</v-btn>
      </v-col>
      <v-col md="auto">
        <v-switch dense label="Only display videos not completely finished" v-model="unfinishedVideosSwitch" />
      </v-col>
    </v-row>
    <v-row v-for="(chunk, chunkId) in chunkedByFour" :key="chunkId">
      <v-col md="3" v-for="doc in chunk" :key="doc._id">
        <VideoItem :video="doc.video" :src-progress="doc.progressPcnt" max-height>
          <ExpandableDate :date="doc.timestamp">
            Watched
          </ExpandableDate>
          <br />
        </VideoItem>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import _chunk from 'lodash-es/chunk'

import { deleteWatchedVideos, getUnfinishedVideos, getWatchedVideos } from '@/store/watched-videos-db'
import VideoItem from '@/components/VideoItem'
import ExpandableDate from '@/components/ExpandableDate'

export default {
  components: {
    ExpandableDate,
    VideoItem
  },
  data: () => ({
    loaded: false,
    data: null,
    unfinishedVideosSwitch: false
  }),

  metaInfo () {
    return {
      title: this.$t('titles.history')
    }
  },

  methods: {
    async loadData (onlyUnfinished = false) {
      if (!onlyUnfinished) {
        this.data = await getWatchedVideos()
      } else {
        this.data = await getUnfinishedVideos()
      }
      this.loaded = true
    },

    async deleteWatchHistory () {
      await deleteWatchedVideos()
      await this.loadData()
    }
  },

  watch: {
    unfinishedVideosSwitch () {
      this.loadData(this.unfinishedVideosSwitch)
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
