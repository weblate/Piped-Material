import Dexie from 'dexie'

export const PMDB = new Dexie('PipedMaterialDB')

PMDB.version(2).stores({
  watchedVideos: '++id,videoId,timestamp'
})

export async function addWatchedVideo (videoObj) {
  return PMDB.watchedVideos.add({
    videoId: videoObj.videoId,
    video: videoObj,
    progress: 0,
    timestamp: new Date()
  })
}

export function updateWatchedVideoProgress (videoID, currentDuration) {
  return PMDB.watchedVideos.update(videoID, {
    progress: currentDuration
  })
}

export function findLastWatch (videoId) {
  return PMDB.watchedVideos.where('videoId').equals(videoId).last()
}

export function getWatchedVideos () {
  return PMDB.watchedVideos.orderBy('timestamp').reverse().toArray()
}

export function deleteWatchedVideos () {
  return PMDB.watchedVideos.clear()
}
