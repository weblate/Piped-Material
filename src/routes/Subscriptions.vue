<template>
  <v-progress-linear v-if="!loaded" />
  <v-container fluid v-else>
	<v-btn outlined color="primary" @click.stop="exportSubs" class="mr-2" v-if="$store.getters['auth/isCurrentlyAuthenticated']">{{ $t('actions.export_subscriptions') }}</v-btn>
	<v-btn outlined color="primary" @click.stop="importSubs" v-if="$store.getters['auth/isCurrentlyAuthenticated']">{{ $t('actions.import_subscriptions') }}</v-btn>
	<v-divider class="my-4" v-if="$store.getters['auth/isCurrentlyAuthenticated']" />
	<GridRow>
		<GridCol v-for="(channel, chid) in data" :key="chid">
			<v-card min-height="100%" outlined link :to="channel.url">
				<v-img :src="channel.avatar" />
				<v-card-title>{{ channel.name }}</v-card-title>
				<v-card-actions>
					<SubscriptionButton :channel-id="channel.id" />
				</v-card-actions>
			</v-card>
		</GridCol>
	</GridRow>
  </v-container>
</template>

<script>
import SubscriptionButton from '@/components/SubscriptionButton.vue'
import GridRow from '@/components/Grid/GridRow.vue'
import GridCol from '@/components/Grid/GridCol.vue'
import { LibPiped } from '@/tools/libpiped'

import { pick as pickFile, save as saveFile } from '@mojee/file-utils'

export default {
	name: 'Subscriptions',
	components: {
		SubscriptionButton,
		GridRow,
		GridCol
	},
	data: () => ({
		loaded: false,
		data: null,
		importDialogOpen: false,
		importSubscriptions: []
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
			this.data = resp.map(r => {
				r.id = LibPiped.determineVideoIdFromChannelURL(r.url)
				return r
			})
		},
		exportSubs () {
			const encoded = JSON.stringify({
				app_version: '',
				app_version_int: 0,
				subscriptions: this.data.map((sub) => ({
					url: 'https://www.youtube.com' + sub.url,
					name: sub.name,
					service_id: 0
				}))
			})
			const blob = new Blob([encoded], {
				type: 'application/json'
			})
			saveFile(blob, this.$t('actions.subscriptions_filename'))
		},
		async importSubs () {
			const file = await pickFile()
			const data = await file.text()

			// NewPipe
			if (file.name?.endsWith('.pipedsubs.json') || data.indexOf('app_version') !== -1) {
				const json = JSON.parse(data)
				json.subscriptions
					.filter(item => item.service_id === 0)
					.forEach(item => {
						const url = item.url
						const id = url.slice(-24)
						this.importSubscriptions.push(id)
					})
			// Invidious
			} else if (data.indexOf('opml') !== -1) {
				const parser = new DOMParser()
				const xmlDoc = parser.parseFromString(data, 'text/xml')
				xmlDoc.querySelectorAll('outline[xmlUrl]').forEach(item => {
					const url = item.getAttribute('xmlUrl')
					const id = url.slice(-24)
					this.importSubscriptions.push(id)
				})
			// Invidious JSON
			} else if (data.indexOf('thin_mode') !== -1) {
				const json = JSON.parse(data)
				this.importSubscriptions = json.subscriptions
			// FreeTube DB
			} else if (data.indexOf('allChannels') !== -1) {
				const json = JSON.parse(data)
				json.subscriptions.forEach(item => {
					this.importSubscriptions.push(item.id)
				})
			// Google Takeout JSON
			} else if (data.indexOf('contentDetails') !== -1) {
				const json = JSON.parse(data)
				json.forEach(item => {
					const id = item.snippet.resourceId.channelId
					this.importSubscriptions.push(id)
				})
			// Google Takeout CSV
			} else if (file.name.length >= 5 && file.name.slice(-4).toLowerCase() === '.csv') {
				const lines = data.split('\n')
				for (let i = 1; i < lines.length; i++) {
					const line = lines[i]
					const id = line.slice(0, line.indexOf(','))
					if (id.length === 24) this.importSubscriptions.push(id)
				}
			}
			await this.$store.dispatch('auth/makeRequest', {
				method: 'POST',
				path: '/import',
				data: this.importSubscriptions
			})
		}
	},
	mounted () {
		this.loadData()
	}
}
</script>
