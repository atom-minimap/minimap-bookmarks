{CompositeDisposable} = require 'atom'

module.exports =
class MinimapBookmarksBinding
  constructor: (@minimap) ->
    @subscriptions = new CompositeDisposable
    @editor = @minimap.getTextEditor()
    @decorationsByMarkerId = {}
    @decorationSubscriptionsByMarkerId = {}

    @subscriptions.add @editor.displayBuffer.onDidCreateMarker (marker) =>
      if marker.matchesProperties(class: 'bookmark')
        @handleMarker(marker)

    @editor.displayBuffer.findMarkers(class: 'bookmark').forEach (marker) =>
      @handleMarker(marker)

  handleMarker: (marker) ->
    {id} = marker
    decoration = @minimap.decorateMarker(marker, type: 'line', class: 'bookmark', plugin: 'bookmarks')
    @decorationsByMarkerId[id] = decoration
    @decorationSubscriptionsByMarkerId[id] = decoration.onDidDestroy =>
      @decorationSubscriptionsByMarkerId[id].dispose()

      delete @decorationsByMarkerId[id]
      delete @decorationSubscriptionsByMarkerId[id]

  destroy: ->
    for id,decoration of @decorationsByMarkerId
      @decorationSubscriptionsByMarkerId[id].dispose()
      decoration.destroy()

      delete @decorationsByMarkerId[id]
      delete @decorationSubscriptionsByMarkerId[id]

    @subscriptions.dispose()
