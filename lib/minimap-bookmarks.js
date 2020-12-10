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
		this.bindings = new Map()
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
			this.bindings.set(minimap.id, binding)

			const subscription = minimap.onDidDestroy(() => {
				binding.destroy()
				this.subscriptions.remove(subscription)
				subscription.dispose()
				this.bindings.delete(minimap.id)
			})
			this.subscriptions.add(subscription)
		})
	},

	deactivatePlugin () {
		if (!this.active) { return }

		const bindings = this.bindings.values()
		for (const binding of bindings) { binding.destroy() }
		this.bindings.clear()
		this.active = false
		this.minimapsSubscription.dispose()
		this.subscriptions.dispose()
	},
}
