import Dexie from 'dexie'

export const PMDB = new Dexie('PipedMaterialDB')

PMDB.version(1).stores({
  watchedVideos: '++id,videoId,timestamp'
})

export async function addWatchedVideo (videoObj) {
  return PMDB.watchedVideos.add({
    videoId: videoObj.videoId,
    video: videoObj,
    timestamp: new Date()
  })
}

export async function isVideoWatched (videoId) {
  const cnt = await PMDB.watchedVideos.where('videoId').equals(videoId).count()
  return cnt !== 0
}

export async function getWatchedVideos () {
  return PMDB.watchedVideos.orderBy('timestamp').reversed().toArray()
}

export async function deleteWatchedVideos () {
  return PMDB.watchedVideos.clear()
}
