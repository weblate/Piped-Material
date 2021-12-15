<template>
  <v-progress-linear v-if="!loaded" />
  <v-container fluid v-else>
    <v-row v-for="(chunk, chunkId) in data" :key="chunkId">
      <v-col md="2" v-for="channel in chunk" :key="channel.name">
        <v-card min-height="100%" outlined link :to="channel.url">
          <v-img :src="channel.avatar" />
          <v-card-title>{{ channel.name }}</v-card-title>
          <v-card-actions>
            <!-- Encapsulate into own item -->
            <SubscriptionButton :channel-id="channel.id" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { chunk as _chunk } from 'lodash-es'

import SubscriptionButton from '@/components/SubscriptionButton'
import { LibPiped } from '@/tools/libpiped'

export default {
	name: 'Subscriptions',
	components: { SubscriptionButton },
	data: () => ({
		loaded: false,
		data: null
	}),
	methods: {
		async loadData () {
			if (!this.$store.getters['auth/isCurrentlyAuthenticated']) {
				await this.$router.replace({
					path: '/'
				})
				return
			}
			const resp = await this.$store.dispatch('auth/makeRequest', {
				method: 'GET',
				path: '/subscriptions'
			})
			this.loaded = true
			this.data = _chunk(resp.map(r => {
				r.id = LibPiped.determineVideoIdFromChannelURL(r.url)
				return r
			}), 6)
		}
	},
	mounted () {
		this.loadData()
	}
}
</script>
