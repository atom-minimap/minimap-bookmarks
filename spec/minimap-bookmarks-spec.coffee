MinimapBookmarks = require '../lib/minimap-bookmarks'

# Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
#
# To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
# or `fdescribe`). Remove the `f` to unfocus the block.

describe "MinimapBookmarks", ->
  [workspaceElement, editor, minimap] = []

  beforeEach ->
    workspaceElement = atom.views.getView(atom.workspace)
    jasmine.attachToDOM(workspaceElement)

    waitsForPromise ->
      atom.workspace.open('sample.coffee').then (e) ->
        editor = e

    waitsForPromise ->
      atom.packages.activatePackage('minimap').then (pkg) ->
        minimap = pkg.mainModule.minimapForEditor(editor)

    waitsForPromise ->
      atom.packages.activatePackage('minimap-bookmarks')

  describe "with an open editor that have a minimap", ->
    [marker1, marker2, marker3] = []
    describe 'when bookmarks markers are added to the editor', ->
      beforeEach ->
        marker1 = editor.markBufferRange([[2,0],[2,0]], class: 'bookmark', invalidate: 'surround')
        marker2 = editor.markBufferRange([[3,0],[3,0]], class: 'bookmark', invalidate: 'surround')

        marker3 = editor.markBufferRange([[1,0],[1,0]], invalidate: 'surround')

      it 'creates decoration for the bookmark markers', ->
        expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(2)

        marker1.destroy()

        expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(1)

        marker2.destroy()

        expect(Object.keys(minimap.decorationsByMarkerId).length).toEqual(0)
