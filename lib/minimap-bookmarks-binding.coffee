{CompositeDisposable} = require 'atom'

module.exports =
class MinimapBookmarksBinding
  constructor: (@minimap) ->
    @subscriptions = new CompositeDisposable
    @editor = @minimap.getTextEditor()
    @decorationsByMarkerId = {}
    @decorationSubscriptionsByMarkerId = {}

    # https://github.com/atom/bookmarks/blob/master/lib/main.coffee#L38
    id = atom.packages.packageStates?.bookmarks?[@editor.id]?.markerLayerId
    markerLayer = markerLayerId && @editor.getMarkerLayer(id)
    if markerLayer?
      @subscriptions.add markerLayer.onDidCreateMarker (marker) =>
        @handleMarker(marker)

      markerLayer.findMarkers().forEach (marker) =>
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
