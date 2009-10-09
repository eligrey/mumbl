/*
 * mumbl JavaScript Library v0.1a3
 * 2009-10-09
 * By Elijah Grey, http://eligrey.com
 *
 * See README.md for help
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global self, setTimeout */

/*jslint white: true, undef: true, eqeqeq: true, bitwise: true, regexp: true,
  strict: true, newcap: true, immed: true, maxerr: 1000, maxlen: 90 */

// Ignore all of JSLint's "Expected an assignment or function call and instead
// saw an expression" errors as the code is perfectly valid.

/* Relevant Player Bugs
 *
 * Songbird:
 *  - [FIXED] http://bugzilla.songbirdnest.com/show_bug.cgi?id=17577
 *      songbird.play() crashes Songbird unless playing and paused
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=17580
 *      songbird.playURL doesn't display artist/track name/etc.
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=17578
 *      songbird.duration or songbird.length needed for currently playing song
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=17582
 *      accessing dataremotes through remoteapi via observers throws exception
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
 *      Ogg-in-Flac files do not show track duration time
 *
 * Chromium / Google Chrome:
 *  - [FIXED] http://code.google.com/p/chromium/issues/detail?id=16768
 *      layout test fails because "ended" event is not triggered when video plays to end
 */

"use strict";

self.mumbl || (self.mumbl = (function (window) {
	var
	
	// Fields:
	$player            = "player",
	$interface         = "_interface",
	
	// Methods:
	$play              = "play",
	$stop              = "stop",
	$pause             = "pause",
	$position          = "position",
	$volume            = "volume",
	$playing           = "playing",
	$stopped           = "stopped",
	$paused            = "paused",
	$loop              = "loop",
	$duration          = "duration",
	$add_track         = "addTrack",
	$remove_track      = "removeTrack",
	$add_tracks        = "addTracks",
	$next              = "next",
	$previous          = "previous",
	$clear             = "clear",
	$track             = "track",
	$tracks            = "tracks",
	$length            = "length",
	$toggle_pause      = "togglePause",
	$mute              = "mute",
	$shuffle           = "shuffle",
	
	True               = !0,
	False              = !True,
	
	players            = 4,
	
	events             = {},
	played             = [],
	
	doc                = window.document,
	audio_elem         = doc && doc.createElement("audio"),
	
	trackIndex         = 0,
	looping            = 2, // 0 = no loop, 1 = loop track, 2 = loop playlist
	duration           = 0,
	volume             = 1,
	playlistLen        = 0,
	
	muted              = False,
	stopped            = True,
	paused             = True,
	shuffled           = False,
	
	add_evt_listener   = "addEventListener",
	
	$bool              = "boolean",
	
	playlist,
	player,
	
	arrayIndexOf = Array.prototype.indexOf || function (elt) {
		var len = this[$length],
			i   = 0;
		for (; i < len; i++) {
			if (i in this && this[i] === elt) {
				return i;
			}
		}
		return -1;
	},
	
	mumbl  = {
		version: "0.1a3",
		player: 0,
		players: {
			UNSUPPORTED   : 0,
			HTML5_AUDIO   : 1,
			SONGBIRD      : 2,
			SOUNDMANAGER2 : 3,
			addPlayer     : function (playerName) { // use this to add custom players
				playerName = playerName.toUpperCase();
				if (!(playerName in this)) {
					this[playerName] = players++;
				}
				return this[playerName];
			}
		},
		listen: function (event, handler) {
			if (events.hasOwnProperty(event)) {
				typeof handler === "function" &&
					events[event].unshift(handler);
			}
		},
		unlisten: function (event, handler) {
			if (events.hasOwnProperty(event)) {
				event = events[event];
				handler = arrayIndexOf.call(event, handler);
				if (handler !== -1) {
					event.splice(handler, 1);
				}
			}
		},
		destruct: function () {
			mumbl[$clear]();
			delete window.mumbl;
		},
		onready: function (callback, scope) {
			if (mumbl.player !== 3) { // !== mumbl.players.SOUNDMANAGER2
				callback.call(scope);
			} else {
				player.onready(callback, scope);
			}
		},
		INTEGRATED: False
	},
	
	isNan = function (n) {
		return typeof n !== "number";
	},
	
	removeFromPlayed = function (track) {
		var i = played[$length];
		while (i--) {
			if (played[i] > track) {
				played[i]--;
			} else if (played[i] === track) {
				played.splice(i, 1);
			}
		}
	},
	
	randomUnplayedTrack = function () {
		var track = Math.floor(Math.random() * playlistLen);
		if (arrayIndexOf.call(played, track) === -1) {
			return track;
		}
		return randomUnplayedTrack();
	},
	
	onEnded = function () {
		var track = mumbl[$track]();
		if (looping) {
			if (looping === 2 && track === mumbl[$length]() - 1) {
				mumbl[$track](0);
			} else if (looping === 1) {
				mumbl[$track](track);
				return;
			}
		}
		if (track < mumbl[$length]() - 1) {
			mumbl[$next]();
		}
	},
	
	slice = function (obj) {
		return Array.prototype.slice.call(obj);
	},
	
	dispatchEvent = function (event) {
		event = events[event];
		var i = event[$length];
		if (i) {
			while (i--) {
				try {
					event[i].call(mumbl);
				} catch (ex) {
					/*setTimeout(function () {
						throw ex;
					}, 0);*/
				}
			}
		}
	},
	
	eventDispatcher = function (event) {
		events[event] = [];
		return function () {
			dispatchEvent(event);
		};
	},
	
	// Event methods:
	
	$canplay  = "canplay",
	$external = "external",
	
	onTrackChange             = eventDispatcher($track),
	onDurationUpdate          = eventDispatcher($duration),
	onPositionUpdate          = eventDispatcher($position),
	onTrackLoad               = eventDispatcher("load"),
	onCanPlayTrack            = eventDispatcher($canplay),
	onCanPlayThroughTrack     = eventDispatcher($canplay + "through"),
	onExternalPlayStateChange = eventDispatcher($external + "playstate"),
	onExternalVolumeChange    = eventDispatcher($external + "volume"),
	onExternalMuteChange      = eventDispatcher($external + "mute"),
	onExternalLoopingChange   = eventDispatcher($external + "looping"),
	onExternalShufflingChange = eventDispatcher($external + "shuffling"),
	
	all_track_handlers = function () {
		onTrackChange();
		onDurationUpdate();
		onPositionUpdate();
		onCanPlayTrack();
		onCanPlayThroughTrack();
		onTrackLoad();
	};
	
	mumbl[$length] = function () {
		return playlistLen;
	};
	mumbl[$playing] = function () {
		return !stopped;
	};
	mumbl[$paused] = function () {
		return paused;
	};
	mumbl[$stopped] = function () {
		return stopped;
	};
	mumbl[$next] = function () {
		var item = mumbl[$track];
		if (!shuffled) {
			if (item() + 1 < mumbl[$length]()) {
				item(item() + 1);
			} else if (looping === 2) {
				item(0);
			}
		} else {
			if (played[$length] === playlistLen) { // played every track
				if (looping === 2) {
					played = [];
				} else {
					return;
				}
			}
			var track = arrayIndexOf.call(played, item()) + 1 && played.push(item());
			if (played[track]) {
				item(played[track]);
			} else {
				played[$length] === playlistLen && (played = []);
				item(randomUnplayedTrack());
			}
		}
	};
	mumbl[$previous] = function () {
		var item = mumbl[$track];
		if (!shuffled) {
			if (item()) {
				item(item() - 1);
			} else if (looping === 2) {
				item(playlistLen - 1);
			}
		} else {
			var track = arrayIndexOf.call(played, item());
			track === -1 && (track = played.push(item()) - 1);
			if (track) {
				item(played[track - 1]);
			} else {
				mumbl[$next]();
			}
		}
	};
	mumbl[$toggle_pause] = function () {
		if (paused) {
			mumbl[$play]();
		} else {
			mumbl[$pause]();
		}
	};
	mumbl[$shuffle] = function (state) {
		if (typeof state !== $bool) {
			return shuffled;
		}
		shuffled = state;
	};
	mumbl[$add_tracks] = function () {
		var args = slice(arguments),
		len = args[$length],
		i = 0;
		for (; i < len; i++) {
			mumbl[$add_track].apply(mumbl, args[i]);
		}
	};
	mumbl[$duration] = function () {
		return duration;
	};
	
	// developer note: To remove last-created library:
	// songbird.siteLibrary.remove(songbird.siteLibrary.getPlaylists().getNext())
	(window.songbird && (function () {
		player               = window.songbird;
		
		var currentTrack     = 0,
		loc                  = window.location,
		notSettingVolume     = True,
		notChangingPlayState = True,
		notMuting            = True,
		notSettingShuffle    = True,
		notSettingLooping    = True,
		library              = player.siteLibrary,
		durationProp         = "http://songbirdnest.com/data/1.0#duration",
		uriProp              = "http://purl.eligrey.com/mumbl#originURI",
		isOGG                = /^a(?:udio|pplication)\/(?:x-)?ogg;?/i,
		addListener          = function (topic, handler) {
			player.addListener(topic, {
				observe: handler
			});
		},
		// convert relative URIs to absolute for Songbird
		absoluteURI          = function (uri) {
			var protocol = loc.protocol + "//";
			uri = uri.replace(/^\/\//, protocol); // handle "//example.com"
			if (/^[\w\-]+:/.test(uri)) {
				return uri;
			}
			if (uri.substr(0, 1) === "/") { // root uri
				return protocol + loc.host + uri;
			} else { // remove everything after last slash
				return protocol + loc.host +
				  (loc.pathname.replace(/([\s\S]*\/)[\s\S]*$/, "$1")) + uri;
			}
		};
		
		playlist = library.createSimpleMediaList("mumbl");
		playlist[$clear](); // just in case it wasn't cleared previously (browser crash)
		
		var ontrackchange_handler = function (evt) {
			var track = evt.item;
			if (!playlist.contains(track)) {
				return;
			}
			currentTrack = track;
			trackIndex   = playlist.indexOf(track);
			duration     = (
				parseInt(
					track.getProperty(durationProp),
					10
				)  / 1000000 // convert microseconds to seconds
			) || 0;
			
			all_track_handlers();
		};
		
		
		mumbl[$player]    = 2; // mumbl.players.SONGBIRD
		mumbl[$interface] = player;
		mumbl.INTEGRATED  = True;
		
		mumbl[$play] = function () {
			// TODO: remove this check once a stable Songbird release contains the fix
			//       for http://bugzilla.songbirdnest.com/show_bug.cgi?id=17577
			if (paused) {
				notChangingPlayState = False;
				player[$play]();
				notChangingPlayState = True;
			}
			stopped = False;
		};
		mumbl[$pause] = function () {
			notChangingPlayState = False;
			player[$pause]();
			notChangingPlayState = True;
		};
		mumbl[$add_track] = function (uri) {
			// Songbird can play anything gstreamer can but has issues with seeking OGG
			// files, so prefer anything that doesn't match /^a(udio|pplication)\/ogg;?/i
			if (arguments[$length] > 2) { // more than one file specified
				var args = slice(arguments),
				len = args[$length],
				file,
				i = 0;
				
				for (; i < len; i += 2) {
					file = args.slice(i, i + 2);
					// file[0] = file URI
					// file[1] = file media type
					if (!isOGG.test(file[1])) {
						uri = file[0];
						break;
					}
				}
			}
			var absURI = absoluteURI(uri);
			var mediaItem = library.createMediaItem(absURI);
			mediaItem.setProperty(uriProp, uri);
			playlist.add(mediaItem);
			
			playlistLen = playlist[$length];
		};
		mumbl[$stop] = function () {
			player[$stop]();
			duration = 0;
			stopped = True;
			all_track_handlers();
		};
		mumbl[$mute] = function (state) {
			if (typeof state !== $bool) {
				return muted;
			}
			notMuting = False;
			player[$mute] = muted = state;
			notMuting = True;
		};
		mumbl[$loop] = function (loopType) {
			if (isNan(loopType)) {
				return looping;
			}
			notSettingLooping = False;
			player.repeat = loopType;
			notSettingLooping = True;
		};
		mumbl[$shuffle] = function (state) {
			if (typeof state !== $bool) {
				return shuffled;
			}
			notSettingShuffle = False;
			player[$shuffle] = state;
			notSettingShuffle = True;
		};
		mumbl[$tracks] = function () {
			// recreate playlist as a TrackItemList
			var tracks = [],
			    track  = playlistLen;
			while (track--) {
				tracks.unshift([playlist.getItemByIndex(track).getProperty(uriProp)]);
			}
			return tracks;
		};
		mumbl[$volume] = function (newVolume) {
			if (isNan(newVolume)) {
				return volume;
			}
			notSettingVolume = False;
			player[$volume] = newVolume * 255;
			notSettingVolume = True;
		};
		mumbl[$track] = function (index) {
			if (isNan(index)) {
				return trackIndex;
			}
			var wasPaused = paused;
			notChangingPlayState = False;
			player.playMediaList(playlist, index);
			if (wasPaused) {
				mumbl[$pause]();
			}
			notChangingPlayState = True;
		};
		mumbl[$remove_track] = function (index) {
			playlist.removeByIndex(index);
			playlistLen = playlist[$length];
		};
		mumbl[$clear] = function () {
			mumbl[$stop]();
			playlist[$clear]();
			playlistLen = playlist[$length];
		};
		mumbl[$playing] = function () {
			return player[$playing];
		};
		mumbl[$position] = function (seconds) {
			if (isNan(seconds)) {
				return player[$position] / 1000;
			} else if (!mumbl[$stopped]()) {
				if (seconds < 0) {
					seconds = 0;
				}
				// can't set it as of v1.4 but can in future
				player[$position] = 1 + (seconds * 1000); // convert seconds to ms
			}
		};
		mumbl.destruct = function () {
			window.removeEventListener("trackchange", ontrackchange_handler, False);
			mumbl[$clear]();
			library.remove(playlist);
			window.removeEventListener("unload", mumbl.destruct, False);
			delete window.mumbl;
		};
		
		addListener("faceplate." + $volume, function () {
			volume = player[$volume] / 255;
			notSettingVolume && onExternalVolumeChange();
		});
		addListener("faceplate." + $mute, function () {
			muted = player[$mute];
			notMuting && onExternalMuteChange();
		});
		addListener("faceplate." + $paused, function () {
			paused = player[$paused];
			notChangingPlayState && onExternalPlayStateChange();
		});
		addListener("playlist.repeat", function () {
			looping = player.repeat;
			notSettingLooping && onExternalLoopingChange();
		});
		addListener("playlist." + $shuffle, function () {
			shuffled = player[$shuffle];
			notSettingShuffle && onExternalShufflingChange();
		});
		addListener("metadata." + $position, onPositionUpdate);
		
		// undocumented "trackchange" event:
		// http://src.songbirdnest.com/source/xref/client/components/remoteapi/src/
		// sbRemotePlayer.cpp#219
		window[add_evt_listener]("trackchange", ontrackchange_handler, False);
		
		window[add_evt_listener]("unload", mumbl.destruct, False);
		
		return (paused = (stopped = True));
	}())) || (typeof audio_elem.canPlayType === "function" && (function () {
		player   = audio_elem;
		playlist = [];
		
		var addEvent,
		clearChildren = function () {
			var nodes = player.childNodes,
			len = nodes[$length],
			i = 0;
			for (; i < len; i++) {
				if (nodes.item(i) !== null) {
					player.removeChild(nodes.item(i));
				}
			}
			player.load();
		},
		// convert [[[1,2],[3,4]],[[5,6],[7,8]]] to [[1,2,3,4],[5,6,7,8]]
		flatPlaylist = function () {
			var track    = playlistLen,
			newPlaylist  = [],
			flatItem     = [],
			items,
			item;
			while (track--) {
				items = playlist[track];
				item = items[$length];
				while (item--) {
					flatItem = items[item].concat(flatItem);
				}
				newPlaylist.unshift(flatItem);
				flatItem = [];
			}
			return newPlaylist;
		};
		
		if (player[add_evt_listener]) {
			addEvent = function (event, handler) {
				player[add_evt_listener](event, handler, False);
			};
		} else if (player.attachEvent) {
			// you never know, IE might actually add support for HTML audio
			addEvent = function (event, handler) {
				player.attachEvent("on" + event, handler);
			};
		}
	
		mumbl[$player]    = 1; // mumbl.players.HTML5_AUDIO
		mumbl[$interface] = player;
		
		
		mumbl[$play] = function () {
			player[$play]();
			(paused = stopped = False);
		};
		mumbl[$pause] = function () {
			player[$pause]();
			paused = !(stopped = False);
		};
		mumbl[$stop] = function () {
			stopped = True;
			duration = 0;
			clearChildren();
			player.load();
			all_track_handlers();
		};		
		mumbl[$clear] = function () {
			mumbl[$stop]();
			playlist = [];
			played   = [];
			playlistLen = playlist[$length];
		};
		mumbl[$add_track] = function () {
			var args  = slice(arguments),
			    len   = args[$length],
			    files = [],
			    i     = 0;
			for (; i < len; i += 2) {
				files.push(args.slice(i, i + 2));
			}
			playlistLen = playlist.push(files);
		};
		mumbl[$remove_track] = function (index) {
			playlist.splice(index, 1);
			playlistLen = playlist[$length];
			removeFromPlayed(index);
		};
		mumbl[$tracks] = function () {
			return flatPlaylist();
		};
		mumbl[$loop] = function (state) {
			if (isNan(state)) {
				return looping;
			}
			(looping = state) && player.ended &&
				onEnded();
		};
		mumbl[$mute] = function (state) {
			if (typeof state !== $bool) {
				return player.muted;
			}
			muted = player.muted = state;
		};
		mumbl[$track] = function (index) {
			if (isNan(index)) {
				return trackIndex;
			}
			var items = playlist[index],
			len = items[$length],
			source,
			i = 0;
			
			clearChildren();
			for (; i < len; i++) {
				source = doc.createElement("source");
				source.setAttribute("src", items[i][0]);
				items[i][1] &&
					source.setAttribute("type", items[i][1]);
				player.appendChild(source);
			}
			trackIndex = index;
			stopped = False;
			player.load();
			if (paused) {
				player[$pause]();
			}
			onTrackChange();
		};
		mumbl[$position] = function (seconds) {
			if (isNan(seconds)) {
				return player.currentTime;
			} else if (!stopped) {
				if (seconds < 1) {
					// fix negative position
					seconds = (seconds < 0 ? 0 : seconds) + 0.01022;
				}
				try {
					player.currentTime = seconds;
					// if it doesn't work, try again in 50ms
					//(Firefox doesn't update the currentTime right away)
				} catch (ex) {
					setTimeout(function () {
						player.currentTime = seconds;
					}, 50);
				}
			}
		};
		mumbl[$volume] = function (vol) {
			if (isNan(vol)) {
				return volume;
			}
			volume = player[$volume] = vol;
		};
		
		doc.documentElement.appendChild(player);
		addEvent($duration + "change", function () {
			duration = player[$duration];
			onDurationUpdate();
		});
		addEvent("timeupdate", onPositionUpdate);
		addEvent("load", onTrackLoad);
		addEvent("canplay", onCanPlayTrack);
		addEvent("canplaythrough", onCanPlayThroughTrack);
		addEvent("ended", onEnded);
		
		return (player.autoplay = True);
	}())) || (window.soundManager && (function () {
		// http://www.schillmania.com/projects/soundmanager2/doc/
		player   = window.soundManager;
		playlist = [];
		
		player.useFastPolling = player.allowPolling = True;
		
		var sounds     = player.sounds,
		mumblNS        = "mumbl:",
		Null           = null,
		currentTrackId,
		// matches MP3, AAC (not AACP), Speex, and ADPCM media types
		// http://en.wikipedia.org/wiki/Flash_Video#Codec_support
		codecs = /^audio\/(?:x-)?(?:mp(?:eg|3)|mp4a-latm|aac|speex|(?:32k)?adpcm);?/i,
		getCurrentTrack = function () {
			return sounds[currentTrackId];
		},
		playSound = function (sound) {
			sound.setVolume(volume * 100);
			sound.setPosition(0);
			sound[$play]();
			if (sound.loaded) {
				all_track_handlers();
			}
		},
		canPlayThrough = function () {
			var track = getCurrentTrack();
			track._iO.whileplaying = onPositionUpdate; // _iO is options
			if (stopped || paused) {
				track[$pause]();
				track.setPosition(0);
			}
			onDurationUpdate();
			onCanPlayThroughTrack();
		},
		readyCheck = function () {
			var track = getCurrentTrack();
			if (track[$duration] > track[$position] - 1) { // > 1 second is loaded
				(track._iO.whileloading = onDurationUpdate)();
				onCanPlayTrack();
			}
		},
		SM2SoundOpts = function (uri) {
			var opts = this;
			opts.id = mumblNS + (opts.url = uri);
			
			// for some reason, SM2 disregards inherited properties, so
			// don't use SoundOpts.prototype
			// callbacks
			opts.onload                 = all_track_handlers;
			opts.whileloading           = readyCheck;
			opts.whileplaying           = canPlayThrough;
			opts.onfinish               = onEnded;
			
			opts.stream                 = True;
			
			// null
			opts.onplay                 = 
			opts.onpause                = 
			opts.onresume               = 
			opts.onstop                 = 
			opts.onid3                  = 
			opts.onbeforefinish         = 
			opts.onbeforefinishcomplete = 
			opts.onjustbeforefinish     = 
			opts.position               = Null;
			
			// false
			opts.autoLoad               = 
			opts.multiShot              = 
			opts.multiShotEvents        = 
			opts.autoPlay               = False;
			
			// ints
			opts.onbeforefinishtime     = 5000;
			opts.onjustbeforefinishtime = 200;
			opts.pan                    = 0;
			opts.volume                 = 100;
		};
		
		mumbl[$player]    = 3; // mumbl.players.SOUNDMANAGER2
		mumbl[$interface] = player;
		
		mumbl[$play] = function () {
			var track = getCurrentTrack();
			if (track && (stopped || paused)) {
				track.resume();
				stopped = paused = False;
			}
		};
		mumbl[$pause] = function () {
			getCurrentTrack()[$pause]();
			paused = True;
		};
		mumbl[$stop] = function () {
			getCurrentTrack()[$stop]();
			paused = stopped = True;
		};
		mumbl[$loop] = function (state) {
			if (isNan(state)) {
				return looping;
			}
			(looping = state) &&
				Math.floor(mumbl[$position]() / mumbl[$duration]()) === 1 && onEnded();
		};
		mumbl[$position] = function (seconds) {
			if (isNan(seconds)) {
				return getCurrentTrack()[$position] / 1000 || 0;
			}
			getCurrentTrack().setPosition(seconds * 1000);
		};
		mumbl[$volume] = function (vol) {
			if (isNan(vol)) {
				return volume;
			}
			volume = vol;
			currentTrackId && getCurrentTrack().setVolume(vol * 100);
		};
		mumbl[$track] = function (index) {
			if (isNan(index)) {
				return trackIndex;
			}
			if (playlistLen) {
				var sound = sounds[playlist[index]];
				if (sound) {
					currentTrackId && getCurrentTrack()[$stop]();
					playSound(sound);
					currentTrackId = playlist[trackIndex = index];
					onTrackChange();
				}
			}
		};
		mumbl[$tracks] = function () {
			var tracks = [],
			    track  = playlistLen;
			while (track--) {
				tracks.unshift([playlist[track].substr(6)]); // 6 == mumblNS.length
			}
			return tracks;
		};
		mumbl[$mute] = function (state) {
			if (typeof state !== $bool) {
				return getCurrentTrack().muted;
			}
			getCurrentTrack()[(state ? "" : "un") + $mute]();
		};
		mumbl[$duration] = function () {
			return (getCurrentTrack().durationEstimate / 1000) || 0;
		};
		mumbl[$add_track] = function (uri) {
			if (arguments[$length] > 2) { // more than one file specified
				var args = slice(arguments),
				len = args[$length],
				file,
				i = 0;
				
				for (; i < len; i += 2) {
					file = args.slice(i, i + 2);
					// file[0] = file URI
					// file[1] = file media type
					if (codecs.test(file[1])) {
						uri = file[0];
						break;
					}
				}
			}
			player.createSound(new SM2SoundOpts(uri));
			playlistLen = playlist.push(mumblNS + uri);
		};
		mumbl[$remove_track] = function (index) {
			sounds[playlist[index]].destruct();
			playlist.splice(index, 1);
			playlistLen = playlist[$length];
			removeFromPlayed(index);
		};
		mumbl[$clear] = function () {
			var i = playlistLen;
			while (i--) {
				mumbl[$remove_track](i);
			}
			currentTrackId = False;
		};
	}()));
	
	return mumbl;
}(self)));
