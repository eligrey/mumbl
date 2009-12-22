mumbl Changelog
===============

0.1b3
-----

 * `version` is now an array instead of a string. The first three items are version
   number parts and the fourth item is a string specifying the status of the version.
   The statuses are a(lpha), b(eta), c(andidate for release), d(ev, pre-alpha) and
   r(elease). The fifth and last item is the version of the status (always 1 for
   release versions). `version.toString()` returns a human-readable version still.
 * Better absolute URI resolving for Songbird.
 * Changed terminology for "event handlers". A function passed to a listener method is
   now called an observer. 
 * Fixed `clearChildren` internal method used to remove the children of the audio element.
 * The test suite has been improved and also now has the looping test automated. The
   points of human interaction are now only the "do you hear music" and "do you not hear
   music" questions.
 * Event observers are now passed the event type they are observing.
 * Removed `trackready` event from documentation. You should be listening for `duration`
   instead.
 * I previously forgot to mention in the changelog and update the documentation that
   the `trackchange` event has been renamed to `track`. This is now fixed.


0.1b2
-----

 * `load` event changed to listen for `suspend` instead of `load` as Firefox no longer
   supports the `load` event on media elements.
 * Audio media types in TrackItems may now contain whitespace before the optional
   semicolon used for specifying the codecs.


0.1b1.1
-----

 * `onready()`'s `callback.call()` usage is now ECMAScript 5-compliant.
 * Added a `playerIs(player)` method to simplify
   `mumbl.player === mumbl.players[player]` checks.


0.1b1
-----

 * Renamed `listen()` and `unlisten()` methods to `addListener()` and `removeListener()`.
 * Implemented a much better absolute URI method for Songbird.


0.1a3
-----

 * Added real `canplaythrough` event support in SM2.
 * Completely scraped and re-did the shuffling feature to allow playlist manipulation.
   The play order is now changed instead of the playlist itself. mumbl's shuffle
   implementation is now compatible with Songbird's.
 * Removed the `trackready` event. The `canplay` event is sufficient for the same usage.
 * Added a shuffle button to the demo.
 * Added `position` and `duration` events. There's now no more need to make timers
   that continuously check `position()`.
 * Shortened many event names. These will likely be the final event names for v0.1 gold.

### Bugfixes

 * \[HTML5, SM2\] Fixed regression from 0.1a2 that messed up the internal `onEnded`
   function.
 * \[Songbird\] Fixed `volume()` returning a value 0xFF<sup>2</sup> times too high.


0.1a2
-----

 * Threw out the old events system in favor of a event listener subscription system.
   Now use `listen(event, handler)` and `unlisten(event, handler)`.
 * Added `onready(callback [, scope])` which calls `callback()` right away
   unless the player being used is SM2, in which case it is forwarded to
   `soundManager.onready`.


0.1a1
-----

 * **SoundManager2 support added!**
 * Beta `shuffle()` implementations. They may be changed in the next version to
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

 * Added `version` string.
 * Added `INTEGRATED` boolean. This represents if there is a native integrated
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
 * Added `destruct()` method to remove mumbl and stop audio playback.
 * Added read-only shuffling support for Songbird.
 * Renamed `players.AUDIO_TAG` to `players.HTML5_AUDIO`.
 * Removed `onExternal*` event handling code from the HTML5 `<audio>` code as it's
   very unlikely it would ever be fired. The `onExternal*` events still work in Songbird.
   * Added `onExternalLoopingChange` and `onExternalShufflingChange`.
 * Now using spaces instead of tabs.

### Bugfixes
 * `addTracks` fixed.
 * \[Songbird\] `addTrack` now searches through the `TrackItem` for any non-OGG files
   so you may now put OGG files at the top of your `TrackItem`s (as long as there are
   other formats specified).
 * \[Songbird\] `play` now checks to see if `songbird.paused` is true before playing
   (otherwise Songbird used to crash).

