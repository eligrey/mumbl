/*
* mumbl JavaScript Library v0.0.1
* Last-modified: 2009-08-10
* By Elijah Grey, http://eligrey.com
*
* See README.md for help
*
* License: GNU GPL v3 and the X11/MIT license
*   See COPYING.md or http://eligrey.com/blog/about/license
*/

/*jslint white: true, browser: true, nomen: true, eqeqeq: true, strict: true, immed: true */

"use strict";

(function () {
	var mumbl = {
		players: {
			UNSUPPORTED   : 0,
			AUDIO_TAG     : 1,
			SONGBIRD      : 2,
			SOUNDMANAGER2 : 3
		}
	},
	
	True              = true,
	False             = false,
	doc               = document,
	audio_tag         = doc.createElement("audio"),
	trackIndex        = 0,
	looping           = 2,
	duration          = 0,
	volume            = 0,
	muted             = False,
	paused            = True,
	notChangingVolume = True,
	notStartingToPlay = True,
	notPausing = True,
	player,
	
	// change these to change the API
	// syntax: $PROPERTY_NAME$ = "propertyName",
	
	// Fields:
	$PLAYER$         = "player",
	$INTERFACE$      = "_interface",

	// Methods:
	$PLAY$           = "play",
	$STOP$           = "stop",
	$PAUSE$          = "pause",
	$POSITION$       = "position",
	$VOLUME$         = "volume",
	$PLAYING$        = "playing",
	$STOPPED$        = "stopped",
	$PAUSED$         = "paused",
	$LOOP$           = "loop",
	$DURATION$       = "duration",
	$ADD_TRACK$      = "addTrack",
	$REMOVE_TRACK$   = "removeTrack",
	$ADD_TRACKS$     = "addTracks",
	$NEXT$           = "next",
	$PREVIOUS$       = "previous",
	$CLEAR$          = "clear",
	$TRACK$          = "track",
	$TRACKS$         = "tracks",
	$LENGTH$         = "length",
	$TOGGLE_PAUSE$   = "togglePause",
	$MUTE$           = "mute",
	
	absoluteURI = function (uri) { // convert relative URIs to absolute for Songbird
		var protocol = location.protocol + "//";
		uri = uri.replace(/^\/\//, protocol);
		if (/^[\w\-]+:/.test(uri)) {
			return uri;
		}
		if (uri.substr(0, 1) === "/") {
			return protocol + location.host + uri;
		} else {
			return protocol + location.host + (location.pathname.replace(/(.*\/).*$/, "$1")) + uri;
		}
	},
	
	createEventHandler    = function (prop) {
		return function () {
			if (typeof mumbl[prop] === "function") {
				mumbl[prop]();
			}
		};
	},
	
	// Event methods:
	
	onTrackChange             = createEventHandler("onTrackChange"),
	onTrackReady              = createEventHandler("onTrackReady"),
	onCanPlayTrack            = createEventHandler("onCanPlayTrack"),
	onCanPlayThroughTrack     = createEventHandler("onCanPlayThroughTrack"),
	onTrackLoad               = createEventHandler("onTrackLoad"),
	onExternalPlayStateChange = createEventHandler("onExternalPlayStateChange"),
	onExternalVolumechange    = createEventHandler("onExternalVolumechange"),
	onExternalMuteChange      = createEventHandler("onExternalMuteChange"),
	
	
	all_track_handlers    = function () {
		onTrackChange();
		onTrackReady();
		onCanPlayTrack();
		onCanPlayThroughTrack();
		onTrackLoad();
	};
	
	// generic/default mumbl functions:
	mumbl[$PLAYER$]       = mumbl.players.UNSUPPORTED;
	
	mumbl[$PLAY$]         = function () {
		if (!mumbl[$STOPPED$]()) {
			notStartingToPlay = False;
			player.play();
			notStartingToPlay = True;
			paused = False;
		}
	};
	mumbl[$PAUSE$]        = function () {
		notPausing = False;
		player.pause();
		notPausing = True;
		paused = True;
	};
	mumbl[$PAUSED$]       = function () {
		return paused;
	};
	mumbl[$NEXT$]         = function () {
		var item = mumbl[$TRACK$];
		if (item() + 1 < mumbl[$LENGTH$]()) {
			item(item() + 1);
		} else if (looping === 2) {
			item(0);
		}
	};
	mumbl[$PREVIOUS$]     = function () {
		var item = mumbl[$TRACK$];
		if (item() - 1 > - 1) {
			item(item() - 1);
		} else {
			item(mumbl[$LENGTH$]() - 1);
		}
	};
	mumbl[$TOGGLE_PAUSE$] = function () {
		if (mumbl[$PAUSED$]()) {
			mumbl[$PLAY$]();
		} else {
			mumbl[$PAUSE$]();
		}
	};
	mumbl[$ADD_TRACKS$]   = function () {
		var args = Array.prototype.slice.call(args),
		len = args.length,
		i = 0;
		for (; i < len; i++) {
			mumbl[$ADD_TRACK$](args[i]);
		}
	};
	mumbl[$DURATION$]     = function () {
		return duration;
	};
	
	// developer note: To remove last-created library: songbird.siteLibrary.remove(songbird.siteLibrary.getPlaylists().getNext())
	if (this.songbird) {
		player               = this.songbird;
		
		var currentTrack,
		addListener = function (topic, handler) {
			player.addListener(topic, {
				observe: handler
			});
		},
		library = player.siteLibrary,
		interfaceEventPrefix = "faceplate.",
		uriProp = "http://purl.eligrey.com/mumbl/songbird#originURI",
		mediaList = library.createSimpleMediaList("mumbl");
		mediaList.clear(); // just in case it wasn't cleared (browser crash)
		
		mumbl[$PLAYER$]      = mumbl.players.SONGBIRD;	
		mumbl[$INTERFACE$]   = player;
		
		mumbl[$ADD_TRACK$]   = function (uri) {
			uri = absoluteURI(uri);
			var mediaItem = library.createMediaItem(uri);
			mediaItem.setProperty(uriProp, uri);
			mediaList.add(mediaItem);
		};
		mumbl[$STOP$]        = function () {
			player.stop();
			duration = 0;
			all_track_handlers();
		};
		mumbl[$MUTE$]        = function () {
			return muted;
		};
		mumbl[$LOOP$]        = function (loopType) {
			if (isNaN(loopType)) { // can't set it as of v1.4 but can in future
				player.repeat = loopType;
				return;
			}
			return looping;
		};
		mumbl[$TRACKS$]      = function () {
			// recreate playlist as a TrackItemList
			var items = [],
			len = mediaList.length,
			i = 0;
			for (; i < len; i++) {
				items[i] = [[mediaList.getItemByIndex(i).getProperty(uriProp)]];
			}
			return items;
		};
		mumbl[$VOLUME$]      = function (newVolume) {
			if (isNaN(newVolume)) {
				return volume;
			}
			notChangingVolume = false;
			player.volume = newVolume * 255;
			notChangingVolume = true;
		};
		mumbl[$LENGTH$]      = function () {
			return mediaList.length;
		};
		mumbl[$TRACK$]       = function (index) {
			if (isNaN(index)) {
				return trackIndex;
			}
			notStartingToPlay = False;
			player.playMediaList(mediaList, index);
			notStartingToPlay = True;
			if (paused) {
				mumbl[$PAUSE$]();
			}
		};
		mumbl[$REMOVE_TRACK$] = function (index) {
			mediaList.removeByIndex(index);
		};
		mumbl[$CLEAR$]       = function () {
			mumbl[$STOP$]();
			mediaList.clear();
		};
		mumbl[$PLAYING$]     = function () {
			return player.playing;
		};
		mumbl[$POSITION$]    = function (seconds) {
			if (isNaN(seconds)) { // can't set it as of v1.4 but can in future
				return player.position / 1000;
			} else if (!mumbl[$STOPPED$]()) {
				if (seconds < 0) {
					seconds = 0;
				}
				player.position = 1 + (seconds * 1000); // convert seconds to milliseconds
			}
		};
		mumbl[$STOPPED$]     = function () {
			return !player.playing;
		};
		
		addListener(interfaceEventPrefix + "volume", function () {
			volume = player.volume * 255;
			if (notChangingVolume) {
				onExternalVolumechange();
			}
		});
		
		addListener(interfaceEventPrefix + "mute", function () {
			muted = player.mute;
			onExternalMuteChange();
		});
		
		addListener(interfaceEventPrefix + "paused", function () {
			if (notStartingToPlay && notPausing) {
				paused  = player.paused;
				onExternalPlayStateChange();
			}
		});
		
		addListener("playlist.repeat", function () {
			looping = player.repeat;
		});
		
		mumbl[$PAUSE$]();
		
		// http://src.songbirdnest.com/source/xref/client/components/remoteapi/src/sbRemotePlayer.cpp#216
		doc.addEventListener("trackchange", function (evt) {
			currentTrack = evt.item;
			trackIndex   = mediaList.indexOf(currentTrack);
			duration     = (parseInt(currentTrack.getProperty("http://songbirdnest.com/data/1.0#duration"), 10) / 1000000) || 0; // convert microseconds to seconds
			
			all_track_handlers();
		}, False);
		
		this.addEventListener("unload", function () {
			mediaList.clear();
			library.remove(mediaList);
		}, False);
	} else {
		// similar methods for HTML5 <audio> and SoundManager2
		var playlist = [];
		
		mumbl[$CLEAR$]       = function () {
			mumbl[$STOP$]();
			playlist = [];
		};
		mumbl[$ADD_TRACK$]    = function () {
			var args = Array.prototype.slice.call(arguments),
			len = args.length,
			files = [],
			i = 0;
			for (; i < len; i += 2) {
				files.push(args.slice(i, i + 2));
			}
			
			playlist.push(files);
		};
		mumbl[$REMOVE_TRACK$] = function (index) {
			playlist.splice(index, 1);
		};
		mumbl[$LENGTH$]     = function () {
			return playlist.length;
		};
		mumbl[$TRACKS$]     = function () {
			return playlist;
		};
		if (typeof audio_tag.canPlayType === "function") {
			player            = audio_tag;
		
			var addEvent, remEvent,
			notEnded = True, // needed for Google Chrome
			audio_tag_stopped = True,
			onended_handler = function () {
				notEnded = False;
				var item = mumbl[$TRACK$];
				if (looping) {
					notEnded = True;
					if (looping === 1) {
						mumbl[$POSITION$](0);
						return;
					} else if (looping === 2 && item() === mumbl[$LENGTH$]() - 1) {
						item(0);
						return;
					}
				}
				if (item() < mumbl[$LENGTH$]() - 1) {
					notEnded = True;
					mumbl[$NEXT$]();
				}
			},
			onvolumechange_handler = function () {
				volume = player.volume;
				if (notChangingVolume) {
					onExternalVolumechange();
				}
			},
			clearChildren = function () {
				var nodes = player.childNodes,
				len = nodes.length,
				i = 0;
				for (; i < len; i++) {
					if (nodes.item(i) !== null) {
						player.removeChild(nodes.item(i));
					}
				}
			};
		
			if (player.addEventListener && player.removeEventListener) {
				addEvent = function (event, handler) {
					player.addEventListener(event, handler, False);
				};
				remEvent = function (event, handler) {
					player.removeEventListener(event, handler, False);
				};
			} else if (player.attachEvent && player.detachEvent) {
				addEvent = function (event, handler) {
					player.attachEvent("on" + event, handler);
				};
				remEvent = function (event, handler) {
					player.detachEvent("on" + event, handler);
				};
			}
		
			mumbl[$PLAYER$]      = mumbl.players.AUDIO_TAG;
			mumbl[$INTERFACE$]   = player;
			
			mumbl[$STOP$]        = function () {
				audio_tag_stopped = True;
				duration = 0;
				clearChildren();
				player.load();
				all_track_handlers();
			};
			mumbl[$LOOP$]     = function (state) {
				if (isNaN(state)) {
					return looping;
				}
			
				if ((looping = state) && player.ended) {
					onended_handler();
				}
			};
			mumbl[$MUTE$]        = function (state) {
				if (typeof state !== "boolean") {
					return player.muted;
				}
				muted = player.muted = state;
			};
			mumbl[$TRACK$]     = function (index) {
				if (isNaN(index)) {
					return trackIndex;
				}
			
				trackIndex = index;
			
				var items = playlist[index],
				len = items.length,
				source,
				i = 0;
			
				clearChildren();
			
				for (; i < len; i++) {
					source = document.createElement("source");
					source.setAttribute("src", items[i][0]);
					if (items[i][1]) {
						source.setAttribute("type", items[i][1]);
					}
					player.appendChild(source);
				}
				audio_tag_stopped = False;
				player.load();
				if (paused) {
					player.pause();
				}
				onTrackChange();
			};
			mumbl[$POSITION$]    = function (seconds) {
				if (isNaN(seconds)) {
					return player.currentTime;
				} else if (!mumbl[$STOPPED$]()) {
					if (seconds < 1) {
						seconds = (seconds < 0 ? 0 : seconds) + 0.01022; // fix negative position
					}
					player.currentTime = seconds;
				}
			};
			mumbl[$VOLUME$]     = function (newVolume) {
				if (isNaN(newVolume)) {
					return volume;
				}
				notChangingVolume = False;
				player.volume = newVolume;
				notChangingVolume = True;
			};
			mumbl[$PLAYING$]    = function () {
				return !mumbl[$PAUSED$]();
			};
			mumbl[$STOPPED$]    = function () {
				return audio_tag_stopped;
			};
			
			doc.documentElement.appendChild(player);
			addEvent("play", function () {
				if (notStartingToPlay) {
					onExternalPlayStateChange();
				}
			});
			addEvent("pause", function () {
				if (notPausing) {
					onExternalPlayStateChange();
				}
			});
			addEvent("loadedmetadata", function () {
				duration = player.duration;
				onTrackReady();
			});
			addEvent("volumechange", onvolumechange_handler);
			addEvent("load", onTrackLoad);
			addEvent("canplay", onCanPlayTrack);
			addEvent("canplaythrough", onCanPlayThroughTrack);
			addEvent("ended", onended_handler);
			
			onvolumechange_handler();
			
			if (this.chrome && navigator.appVersion.indexOf("Chrome/3") !== -1) {
				// http://code.google.com/p/chromium/issues/detail?id=16768
				addEvent("timeupdate", function () {
					if (notEnded && player.ended) {
						onended_handler();
					}
				});
			}
			player.autoplay = true;
		} /*else if (this.soundManager) {
			// http://www.schillmania.com/projects/soundmanager2/doc/
			player = this.soundManager;
			mumbl[$PLAYER$]     = mumbl.players.SOUNDMANAGER2;
			mumbl[$INTERFACE$]  = player;
			// TODO: Implement SoundManager 2 support
		}*/
	}
	
	this.mumbl = mumbl;
}.call(this));
