/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS201: Simplify complex destructure assignments
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const { CompositeDisposable } = require('atom')
let MinimapBookmarksBinding

module.exports = {
	isActive () {
		return this.active
	},

	activate () {
		this.active = false
		this.subscriptions = new CompositeDisposable()
		this.bindings = {}
		require('atom-package-deps').install('minimap-git-diff')
	},

	consumeMinimapServiceV1 (minimap) {
		this.minimap = minimap
		this.minimap.registerPlugin('bookmarks', this)
	},

	deactivate () {
		if (this.minimap) {
			this.minimap.unregisterPlugin('bookmarks')
		}
		this.minimap = null
	},

	activatePlugin () {
		if (this.active) {
			return
		}

		const bookmarksPkg = atom.packages.getLoadedPackage('bookmarks')
		if (!bookmarksPkg) {
			return
		}
		const bookmarks = bookmarksPkg.mainModule
		this.active = true

		this.minimapsSubscription = this.minimap.observeMinimaps(minimap => {
			if (!MinimapBookmarksBinding) {
				MinimapBookmarksBinding = require('./minimap-bookmarks-binding')
			}

			const binding = new MinimapBookmarksBinding(minimap, bookmarks)
			this.bindings[minimap.id] = binding

			const subscription = minimap.onDidDestroy(() => {
				binding.destroy()
				this.subscriptions.remove(subscription)
				subscription.dispose()
				delete this.bindings[minimap.id]
			})
			this.subscriptions.add(subscription)
		})
	},

	deactivatePlugin () {
		if (!this.active) { return }

		for (const id in this.bindings) { const binding = this.bindings[id]; binding.destroy() }
		this.bindings = {}
		this.active = false
		this.minimapsSubscription.dispose()
		this.subscriptions.dispose()
	},
}
