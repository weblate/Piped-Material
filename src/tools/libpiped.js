import DOMPurify from 'dompurify'

class LibPiped {
	pad (num, size) {
		return ('000' + num).slice(size * -1)
	}

	timeFormat (duration) {
		const time = parseFloat(duration).toFixed(3)
		const hours = Math.floor(time / 60 / 60)
		const minutes = Math.floor(time / 60) % 60
		const seconds = Math.floor(time - minutes * 60)

		let str = ''

		if (hours > 0) str += hours + ':'

		str += this.pad(minutes, 2) + ':' + this.pad(seconds, 2)

		return str
	}

	addCommas (num) {
		num = parseInt(num)
		return num.toLocaleString('en-US')
	}

	purifyHTML (original) {
		return DOMPurify.sanitize(original)
	}

	determineVideoIdFromPath (path) {
		const loc = new URL(path, 'http://localhost')
		return loc.searchParams.get('v')
	}

	determineVideoIdFromChannelURL (path) {
		const pathParts = path.split('/')
		return pathParts[2]
	}
}

const lp = new LibPiped()
export { lp as LibPiped }
