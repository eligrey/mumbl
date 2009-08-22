mumbl
=====

*Version 0.0.2*

**mumbl** is a JavaScript library that makes it easy to play music and create playlists on web pages.

Demo
----

A demo is included with mumbl but if you dont want to download it, there is also an [online demo][demo].

Please note that mumbl is not the player in the demo. mumbl is the *back-end* and the demo is just an example of using mumbl.

Testers Needed!
---------------

If you would like to help test mumbl on your browser, please [contact me][contact].

Supported Platforms
-------------------

 * All browsers that support HTML5 `<audio>` tags.
 * [Songbird][sb]
 * [SoundManager 2][sm2] (not yet, but planned for version 0.1)

API
---

### Methods:

<dl>
	<dt><code>mumbl.addTrack(TrackItem):void</code>
	<dd>Adds <code>TrackItem</code> to the playlist.</dd>

	<dt><code>mumbl.addTracks(TrackItemList):void</code>
	<dd>Adds every <code>TrackItem</code> in <code>TrackItemList</code> to the playlist.</dd>

	<dt><code>mumbl.clear():void</code>
	<dd>Clears the playlist.</dd>

	<dt><code>mumbl.duration():float</code>
	<dd>Returns the duration in seconds of the currently selected track.</dd>

	<dt><code>mumbl.loop(loopType:int /*0 to 2*/)</code>
	<dd>If <code>loopType</code> is not a number, the currently stored <code>loopType</code> is returned.</dd>
	<dd>If <code>loopType</code> is <code>0</code>, looping is turned off.</dd>
	<dd>If <code>loopType</code> is <code>1</code>, the current track is looped.</dd>
	<dd>If <code>loopType</code> is <code>2</code>, the playlist is looped. This is the default <code>loopType</code>.</dd>

	<dt><code>mumbl.length():int</code>
	<dd>Returns the amount of tracks in the playlist.</dd>

	<dt><code>mumbl.mute(muteState:boolean):boolean, void</code>
	<dd>If <code>muteState</code> is not boolean, this returns <code>true</code> if the player is muted or <code>false</code> if the player is not muted.</dd>
	<dd>If <code>muteState</code> is <code>true</code>, the player is muted if not already muted.</dd>
	<dd>If <code>muteState</code> is <code>false</code>, the player is unmuted if not already unmuted.</dd>

	<dt><code>mumbl.next():void</code>
	<dd>Selects the next track in the playlist from the currently selected track.</dd>

	<dt><code>mumbl.play():void</code>
	<dd>Plays the current track at its current position.</dd>

	<dt><code>mumbl.pause():void</code>
	<dd>Pauses playback of the current track.</dd>

	<dt><code>mumbl.paused():boolean</code>
	<dd>Returns <code>true</code> if player is currently paused. Otherwise, returns <code>false</code>.</dd>

	<dt><code>mumbl.playing():boolean</code>
	<dd>Returns <code>true</code> if player is currently playing. Otherwise, returns <code>false</code>.</dd>

	<dt><code>mumbl.previous():void</code>
	<dd>Selects the previous track in the playlist from the currently selected track.</dd>

	<dt><code>mumbl.position(newPosition:float /*seconds*/):void, float</code>
	<dd>If <code>newPosition</code> is not a number, the current position of the current track is returned.</dd>
	<dd>If <code>newPosition</code> is defined, the current track will seek to <code>newPosition</code>.</dd>

	<dt><code>mumbl.shuffle(shuffleState:boolean):boolean, void)</code> (<strong>Unimplemented</strong> as of 0.0.2, with a read-only implementation for Songbird)
	<dd>If <code>shuffleState</code> is not boolean, the shuffle state of the playlist is returned.</dd>
	<dd>If <code>shuffleState</code> is <code>true</code>, the random items from the playlist are played until every item has been played.</dd>
	<dd>If <code>shuffleState</code> is <code>false</code>, the playlist is played in the order it was created.</dd>

	<dt><code>mumbl.stop():void</code>
	<dd>Stops playback if playing and resets the position of the currently selected track.</dd>

	<dt><code>mumbl.stopped():boolean</code>
	<dd>Returns <code>true</code> if player is currently stopped. Otherwise, returns <code>false</code>. <code>mumbl.stopped()</code> is <code>false</code> after you select a track because the track is loaded. It will only be <code>true</code> again after you call <code>mumbl.stop()</code> or <code>mumbl.clear()</code>.</dd>

	<dt><code>mumbl.track(trackNumber:int):void</code>
	<dd>Selects <code>trackNumber</code> from the playlist as the current track.</dd>

	<dt><code>mumbl.tracks():TrackItemList</code>
	<dd>Returns the <code>TrackItemList</code> representing the playlist.</dd>

	<dt><code>mumbl.togglePause():void</code>
	<dd>Toggles the playing state of the player from paused to playing or playing to paused.</dd>

	<dt><code>mumbl.volume(newVolume:float /*0 to 1*/):void, float</code>
	<dd>If <code>newVolume</code> is not a number, the player volume (0 to 1) is returned.</dd>
	<dd>If <code>newVolume</code> is defined, the player volume is set to <code>newVolume</code>.</dd>
</dl>

### Fields

<dl>
	<dt><code>mumbl.players</code></dt>
	<dd>An object populated with constants representing various players:
		<ul>
			<li><code>UNSUPPORTED</code></li>
			<li><code>HTML5_AUDIO</code></li>
			<li><code>SONGBIRD</code></li>
			<li><code>SOUNDMANAGER2</code></li>
		</ul>
	</dd>
	<li><code>mumbl.player</code> - The player from <code>mumbl.players</code> used to play audio.</li>
	<li><code>mumbl._interface</code> - The interface to the player being used.</li>
</dl>

### Event Handlers

Define any of the following methods and they will be called during the appropriate events. External events occur when a user directly interacts with a player's native interface (like Songbird) or if the native interface is progmatically interacted with outside of the mumbl library.

<dl>
	<dt><code>mumbl.onTrackChange</code>
	<dd>This is called when a track is selected. The track number is available at this time.</dd>
	<dt><code>mumbl.onTrackReady</code>
	<dd>This is called after when the metadata for the selected track (including the duration) is accessible.</dd>
	<dt><code>mumbl.onCanPlayTrack</code>
	<dd>This is called when enough data from the currently selected track is loaded that it can play.</dd>
	<dt><code>mumbl.onCanPlayThroughTrack</code>
	<dd>This is called when the rate at which the data from the selected track is loading fast enough to play through the whole track.</dd>
	<dt><code>mumbl.onTrackLoad</code>
	<dd>This is called when all of the data for the selected track has been loaded.</dd>
	<dt><code>mumbl.onExternalPlayStateChange</code>
	<dd>This is called when the playing state of the player is changed externally.</dd>
	<dt><code>mumbl.onExternalVolumeChange</code>
	<dd>This is called when the volume of the player is changed externally.</dd>
	<dt><code>mumbl.onExternalMuteChange</code>
	<dd>This is called when the player is muted or unmuted externally.</dd>
	<dt><code>mumbl.onExternalLoopingChange</code>
	<dd>This is called when the player's looping state is externally changed.</dd>
	<dt><code>mumbl.onExternalShufflingChange</code>
	<dd>This is called when the player's shuffling state is externally changed.</dd>
</dl>

**\***Note: A TrackItemList is an array of TrackItems. A TrackItem is a list that follows the following format. When a TrackItem or a TrackItemList is specified as the only argument for a function, pass every array indice as a separate argument. e.g., `someFunction(TrackItem)` would be called as `someFunction(URI-1, media-type-1, ... URI-N, media-type-N)` and `someFunction(TrackItemList)` would be called as `someFunction(TrackItem-1, ... TrackItem-N)`.


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
   * Add playlist shuffle functionality.
   * Add support for SoundManager2.
   * Do cross-browser testing.
     * Get testers for browsers I can't test.
 * Eventually, after version 0.1 is released.
   * Create a simple library for turning all MP3, OGG, WAV, etc. links into mumbl-powered audio players.
   * Make the demo mumbl-powered music player (it will be renamed "mumblr") portable and reusable.
     * Remove jQuery dependancy from mumblr.
     * Make the track title display scroll (maybe using a `<marquee>`) when it overflows.


  [contact]: http://github.com/eligrey
  [demo]: http://purl.eligrey.com/mumbl/demo
  [sb]: http://getsongbird.com/
  [sm2]: http://www.schillmania.com/projects/soundmanager2/
  [bug15169]: http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
