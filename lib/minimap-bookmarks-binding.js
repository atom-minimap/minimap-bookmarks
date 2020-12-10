const { CompositeDisposable } = require('atom')

class MinimapBookmarksBinding {
	constructor (minimap, bookmarks) {
		this.minimap = minimap
		this.bookmarks = bookmarks
		if ((this.minimap == null) || (this.bookmarks == null)) { return }

		this.subscriptions = new CompositeDisposable()
		this.editor = this.minimap.getTextEditor()
		this.decorationsByMarkerId = new Map()
		this.decorationSubscriptionsByMarkerId = new Map()

		// We need to wait until the bookmarks package had created its marker
		// layer before retrieving its id from the state.
		requestAnimationFrame(() => {
			// Also, targeting private properties on atom.packages is very brittle.
			// DO NOT DO THAT!
			//
			// If we really have to get the marker layer id from the
			// state (which can already break easily) it's better to get it from the
			// package `serialize` method since it's an API that is public and is
			// unlikely to change in a near future.
			const bookmarks = this.bookmarks.serialize()[this.editor.id]
			if (!bookmarks) { return }

			const markerLayer = this.editor.getMarkerLayer(bookmarks.markerLayerId)

			if (!markerLayer) { return }

			this.subscriptions.add(markerLayer.onDidCreateMarker(marker => {
				this.handleMarker(marker)
			}))

			markerLayer.findMarkers().forEach(marker => this.handleMarker(marker))
		})
	}

	handleMarker (marker) {
		const { id } = marker
		const decoration = this.minimap.decorateMarker(marker, { type: 'line', class: 'bookmark', plugin: 'bookmarks' })
		this.decorationsByMarkerId.set(id, decoration)
		this.decorationSubscriptionsByMarkerId.set(id,
			decoration.onDidDestroy(() => {
				this.decorationSubscriptionsByMarkerId.get(id).dispose()

				this.decorationsByMarkerId.delete(id)
				this.decorationSubscriptionsByMarkerId.delete(id)
			}),
		)
	}

	destroy () {
		const ids = this.decorationsByMarkerId.keys()
		for (const id of ids) {
			const decoration = this.decorationsByMarkerId.get(id)
			this.decorationSubscriptionsByMarkerId.get(id).dispose()
			decoration.destroy()

			this.decorationsByMarkerId.delete(id)
			this.decorationSubscriptionsByMarkerId.delete(id)
		}

		this.subscriptions.dispose()
	}
}

module.exports = MinimapBookmarksBinding
