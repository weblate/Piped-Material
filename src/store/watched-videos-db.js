import Dexie from 'dexie'

export const PMDB = new Dexie('PipedMaterialDB')

PMDB.version(3).stores({
	watchedVideos: '++id,videoId,progressPcnt,timestamp'
})

export async function addWatchedVideo (videoObj) {
	return PMDB.watchedVideos.add({
		videoId: videoObj.videoId,
		video: videoObj,
		progress: 0,
		progressPcnt: 0,
		timestamp: new Date()
	})
}

export function updateWatchedVideoProgress (videoID, prog, dur) {
	return PMDB.watchedVideos.update(videoID, {
		progress: prog,
		progressPcnt: Math.min((prog / dur) * 100, 100)
	})
}

export async function findLastWatch (videoId) {
	const v = await PMDB.watchedVideos.where('videoId').equals(videoId).reverse().sortBy('progressPcnt')
	return v[0]
}

export function getWatchedVideos () {
	return PMDB.watchedVideos.orderBy('timestamp').reverse().toArray()
}

export function getUnfinishedVideos () {
	// Shaka never fires the last event, thus the last percent turns out to be around 99.95 or 99.98
	return PMDB.watchedVideos.where('progressPcnt').below(99.9).reverse().sortBy('timestamp')
}

export function deleteWatchedVideos () {
	return PMDB.watchedVideos.clear()
}
