mumbl Changelog
===============

0.1a1
-----

 * **SoundManager2 support added!**
 * Beta `mumbl.shuffle()` implementations. They may be changed in the next version to
   make it possible to change the real playlist when shuffle is on.
 * Songbird audio file origin URI property changed to
   `http://purl.eligrey.com/mumbl#originURI`.
 * Added closures for each of the three players to save memory and make it easier to
   use [Doloto](http://msdn.microsoft.com/en-us/devlabs/ee423534.aspx) with mumbl.
 * Limited README.md's source to 80 columns of characters so it is readable with
   text-wrap turned off.
 * Many improvements to the test suite.


0.0.4
-----

 * Added `mumbl.version` string.
 * Added `mumbl.INTEGRATED` boolean. This represents if there is a native integrated
   interface being used for the player.
 * Going back to tabs.
 * Added some stuff to get ready for adding SM2 support.
 * No longer defines HTML5 audio and SM2 shared methods if the browser is
   unsupported.
 * Internal API naming changes. (`$METHOD_NAME$` is now `$METHOD_NAME`)

### Bugfixes

 * Fixed internal `onplaypause_handler` firing twice and it now correctly fires when a
   play event happens.


0.0.3
-----

 * Chromium [issue 16768](http://code.google.com/p/chromium/issues/detail?id=16768) has
   been fixed so the workaround code is no longer needed.


0.0.2
-----

 * Created unit tests.
 * Added `mumbl.destruct()` method to remove mumbl and stop audio playback.
 * Added read-only shuffling support for Songbird.
 * Renamed `mumbl.players.AUDIO_TAG` to `mumbl.players.HTML5_AUDIO`.
 * Removed `onExternal*` event handling code from the HTML5 `<audio>` code as it's
   very unlikely it would ever be fired. The `onExternal*` events still work in Songbird.
   * Added `mumbl.onExternalLoopingChange` and `mumbl.onExternalShufflingChange`.
 * Now using spaces instead of tabs.

### Bugfixes
 * `mumbl.addTracks` fixed.
 * \[Songbird\] `mumbl.addTrack` now searches through the `TrackItem` for any non-OGG files
   so you may now put OGG files at the top of your `TrackItem`s (as long as there are
   other formats specified).
 * \[Songbird\] `mumbl.play` now checks to see if `songbird.paused` is true before playing
   (otherwise Songbird used to crash).

