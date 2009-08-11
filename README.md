mumbl
=====

*Version 0.0.1*

**mumbl** is a JavaScript library that makes it easy to play music and create playlists on web pages.

Demo
----

A demo is included with mumbl but if you dont want to download it, there is also an [online demo][demo].

Supported Platforms
-------------------

 * All browsers that support HTML5 `<audio>` tags.
 * [Songbird][sb]
 * [SoundManager 2][sm2] (not yet, but planned for version 0.1)

API
---

### Methods:

 * `mumbl.play():void`
   * Plays the current track at its current position.
 * `mumbl.stop():void`
   * Stops playback if playing and resets the position of the currently selected track.
 * `mumbl.pause():void`
   * Pauses playback of the current track.
 * `mumbl.addTrack(TrackItem):void`
   * Adds `TrackItem` to the playlist.
 * `mumbl.addTracks(TrackItemList):void`
   * Adds every `TrackItem` in `TrackItemList` to the playlist.
 * `mumbl.tracks():TrackItemList`
   * Returns the `TrackItemList` representing the playlist.
 * `mumbl.length():int`
   * Returns the amount of tracks in the playlist.
 * `mumbl.track(trackNumber:int):void`
   * Selects `trackNumber` from the playlist as the current track.
 * `mumbl.next():void`
   * Selects the next track in the playlist from the currently selected track.
 * `mumbl.previous():void`
   * Selects the previous track in the playlist from the currently selected track.
 * `mumbl.clear():void`
   * Clears the playlist.
 * `mumbl.togglePause():void`
   * Toggles the playing state of the player from paused to playing or playing to paused.
 * `mumbl.playing():boolean`
   * Returns `true` if player is currently playing. Otherwise, returns `false`.
 * `mumbl.stopped():boolean`
   * Returns `true` if player is currently stopped. Otherwise, returns `false`.
 * `mumbl.paused():boolean`
   * Returns `true` if player is currently paused. Otherwise, returns `false`.
 * `mumbl.duration():float`
   * Returns the duration in seconds of the currently selected track.
 * `mumbl.position(newPosition:float /*seconds*/):void, float`
   * If `newPosition` is defined, the current track will seek to `newPosition`.
   * If `newPosition` is not defined, the current position of the current track is returned.
 * `mumbl.volume(newVolume:float /*0 to 1*/):void, float`
   * If `newVolume` is defined, the player volume is set to `newVolume`.
   * If `newVolume` is not defined, the player volume is returned.
 * `mumbl.loop(loopType:int /*0 to 2*/)`
   * If `loopType` is not defined, the currently stored `loopType` is returned.
   * If `loopType` is `0`, looping is turned off.
   * If `loopType` is `1`, the current track is looped.
   * If `loopType` is `2`, the playlist is looped. This is the default `loopType`.
 * `mumbl.mute(muteState:boolean):boolean, void`
   * If `muteState` is not defined, this returns `true` if the player is muted or `false` if the player is not muted.
   * If `muteState` is true, the player is muted if not already muted.
   * If `muteState` is false, the player is unmuted if not already unmuted.

###Fields:

 * `mumbl.players` - An object populated with constants representing various players:
   * `UNSUPPORTED` - 0
   * `AUDIO_TAG` - 1
   * `SONGBIRD` - 2
   * `SOUNDMANAGER2` - 3
 * `mumbl.player` - The player from `mumbl.players` used to play audio.
 * `mumbl._interface` - The interface to the player being used.

###Event Handlers:

Define any of the following methods and they will be called during the appropriate events. External events occur when a user directly interacts with a player's native interface (like Songbird) or if the native interface is progmatically interacted with outside of the mumbl library.

 * `mumbl.onTrackChange`
   * This is called when a track is selected. The track number is available at this time.
 * `mumbl.onTrackReady`
   * This is called after when the metadata for the selected track (including the duration) is accessible.
 * `mumbl.onCanPlayTrack`
   * This is called when enough data from the currently selected track is loaded that it can play.
 * `mumbl.oncanplaythroughtrack`
   * This is called when the rate at which the data from the selected track is loading fast enough to play through the whole track.
 * `mumbl.onTrackLoad`
   * This is called when all of the data for the selected track has been loaded.
 * `mumbl.onExternalPlayStateChange`
   * This is called when the playing state of the player is changed externally.
 * `mumbl.onExternalVolumeChange`
   * This is called when the volume of the player is changed externally.
 * `mumbl.onExternalMuteChange`
   * This is called when the player is muted or unmuted externally.


**\***Note: A TrackItemList is an array of TrackItems. A TrackItem is a list that follows the following format. When a TrackItem is specified as the only argument for a function, pass every array indice as a separate argument.


The choices are in order of preference. If you do not know the media type of an audio file, just pass `null` in place of the media type.

    [
      choice-1-URI, choice-1-media-type,
      choice-2-URI, choice-2-media-type,
      ...
      choice-N-URI, choice-N-media-type
    ]


Roadmap
-------

 * Version 0.1
   * Add support for SoundManager2
   * Add playlist shuffle functionality.
   * Alphabetize the method definitions. \* Also remember to keep it alphabetized in future versions.
 * Version 0.1.1
   * Implement multi-playlist functionality
   * Create a simple mumbl module for turning all MP3, OGG, and WAV links into mumbl-powered audio players.
   * Make the demo mumbl-powered music player portable and reusable as a mumbl module. (I'm thinking of naming it mumbl**r**)
     * Make the track title display scroll (maby using a `<marquee>`) when it overflows.

(The term "mumbl module" refers to a JavaScript library that makes use of mumbl.)

Known Bugs
----------

mumbl has no known bugs!

### External bugs (problems with the players themselves):

 * Songbird's seek bar doesn't work for OGG files. ([Songbird bug 15169][bug15169])
   * **Solution**: Put MP3 files before OGG files in TrackItems.
 * Songbird reverts seeks right after you do them.


  [demo]: http://purl.eligrey.com/mumbl/demo
  [sb]: http://getsongbird.com/
  [sm2]: http://www.schillmania.com/projects/soundmanager2/
  [bug15169]: http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
