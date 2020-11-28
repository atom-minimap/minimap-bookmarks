const MinimapBookmarks = require('../lib/minimap-bookmarks')

describe('MinimapBookmarks', () => {
	let editor, editorElement, bookmarks

	const bookmarkedRangesForEditor = (editor) => {
		const obj = editor.decorationsStateForScreenRowRange(0, editor.getLastScreenRow())
		return Object.keys(obj)
			.map(k => obj[k])
			.filter(decoration => decoration.properties.class === 'bookmarked')
			.map(decoration => decoration.screenRange)
	}

	beforeEach(async () => {
		const workspace = atom.views.getView(atom.workspace)
		jasmine.attachToDOM(workspace)

		// Package activation will be deferred to the configured, activation hook, which is then triggered
		// Activate activation hook
		atom.packages.triggerDeferredActivationHooks()
		atom.packages.triggerActivationHook('core:loaded-shell-environment')

		editor = await atom.workspace.open('sample.js')
		editorElement = atom.views.getView(editor)

		bookmarks = (await atom.packages.activatePackage('bookmarks')).mainModule

		await atom.packages.activatePackage('minimap')
		await atom.packages.activatePackage('minimap-bookmarks')

		atom.packages.packageStates.bookmarks = bookmarks.serialize()
	})

	it('should activate', () => {
		expect(MinimapBookmarks.isActive()).toBe(true)
	})

	describe('with an open editor that have a minimap', () => describe('when toggle switch bookmarks markers to the editor', () => {
		beforeEach(() => {
			editor.setCursorScreenPosition([2, 0])
			atom.commands.dispatch(editorElement, 'bookmarks:toggle-bookmark')

			editor.setCursorScreenPosition([3, 0])
			atom.commands.dispatch(editorElement, 'bookmarks:toggle-bookmark')

			editor.setCursorScreenPosition([1, 0])
			atom.commands.dispatch(editorElement, 'bookmarks:toggle-bookmark')
			atom.commands.dispatch(editorElement, 'bookmarks:toggle-bookmark')
		})

		it('creates tow markers', () => {
			expect(bookmarkedRangesForEditor(editor).length).toBe(2)
		})

		it('creates state of bookmarks', () => {
			expect(Object.keys(atom.packages.packageStates.bookmarks).length).toBe(1)
		})

		it('gets markerLayerId from state of bookmarks by editorId', () => {
			const { markerLayerId } = atom.packages.packageStates.bookmarks[editor.id]

			expect(markerLayerId).toBeDefined()
		})

		it('finds marks by markerLayerId', () => {
			const { markerLayerId } = atom.packages.packageStates.bookmarks[editor.id]
			const markerLayer = editor.getMarkerLayer(markerLayerId)
			expect(markerLayer.findMarkers().length).toBe(2)
		})
	}))
})
