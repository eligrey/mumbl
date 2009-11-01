/*jslint browser: true */

// XXX: make a portable library out of this mess

mumbl.onready(function () {
	var $ = jQuery,
	window = this,
	playlist = [
		"Cryogenic Unrest",
		"SOS Distress",
		"Disturbed Orbit",
		"Ghosts in HyperSpace",
		"Binary Lovers"
	];
	playlist.location = "music/%40F1LT3R%20-%20";

	playlist.artist = "F1LT3R";
	playlist.album  = "35 Days";
    
	for (var i = 0; i < playlist.length; i++) {
		mumbl.addTrack(
			playlist.location + encodeURIComponent(playlist[i]) + ".ogg", "audio/ogg; codecs=vorbis",
			playlist.location + encodeURIComponent(playlist[i]) + ".mp3", "audio/mpeg"
		);
	}
	
	if (mumbl.playerIs("Songbird")) {
	// stop Songbird from making it's own playlist out of the links on the page
		$("#playlist a").attr("href", "#");
	}
	
	if (mumbl.INTEGRATED || mumbl.playerIs("unsupported")) {
		// hide interface if there is a native interface or if mumbl is unsupported
		$("#mumbl-player").hide();
		if (mumbl.INTEGRATED) {
			mumbl.track(0);
		}
		return;
	}

	function toMinsSecs(seconds) {
		var secsLeft = (seconds % 60).toFixed(0);
		if (secsLeft.length < 2) {
			secsLeft = "0" + secsLeft;
		}
		return Math.floor(seconds / 60) + ":" + secsLeft;
	}
	

	var player     = document.getElementById("mumbl-player"),
	iconClass      = "ui-icon-",
	volIconClass   = iconClass + "volume-",
	volBtn         = $("#mumbl-volume"),
	playBtn        = $("#mumbl-play-pause"),
	loopBtn        = $("#mumbl-loop"),
	shuffleBtn     = $("#mumbl-shuffle"),
	progress       = $("#mumbl-progress").progressbar(),
	trackPosition  = $("#mumbl-track-position"),
	trackDuration  = $("#mumbl-track-duration"),
	trackTitle     = $("#mumbl-track-title"),
	lastPosition   = 0,
	duration       = 0,
	draggingPlayer = false;
	
	function mouseMoveHandler (e) {
		if (draggingPlayer) {
			var scrollX = window.scrollX || window.pageXOffset,
			mouseX      = (e.clientX - player.offsetLeft + scrollX);
			mouseX      = mouseX < 0 ? 0 : mouseX;
			
			if (mouseX >= player.clientWidth) {
				mouseX = player.clientWidth - 1; // -1 so the next track isn't played
			}
			mumbl.position((mumbl.duration() / player.clientWidth) * mouseX);
		}
	}
	
	$(document).
		mousemove(mouseMoveHandler)
		.mouseup(function() {
			setTimeout(function() {
				draggingPlayer = false;
			}, 1);
		});
		// TODO: keyboard controls
		//.keydown(function(e) {
		//
		//});
	
	$(player)
		.click(mouseMoveHandler)
		.mousedown(function (e) {
			draggingPlayer = true;
			e.preventDefault();
		});
	
	function nextBtnClick() {
		draggingPlayer = false;
		mumbl.next();
	}
	
	function prevBtnClick() {
		draggingPlayer = false;
		mumbl.previous();
	}
	
	function changeVolIcon(state) {
		if (state) {
			volBtn
				.removeClass(volIconClass + "off")
				.addClass(volIconClass + "on")
				.attr("title", "Mute: Off");
			return;
		}
		volBtn
			.removeClass(volIconClass + "on")
			.addClass(volIconClass + "off")
			.attr("title", "Mute: On");
	}
	
	function volBtnClick() {
		draggingPlayer = false;
		var muted = mumbl.mute();
		mumbl.mute(!muted);
		changeVolIcon(muted);
	}
	

	function changePlayIcon(state) {
		if (state) {
			playBtn
				.removeClass(iconClass + "play")
				.addClass(iconClass + "pause")
				.attr("title", "Pause");
			return;
		}
		playBtn
			.removeClass(iconClass + "pause")
			.addClass(iconClass + "play")
			.attr("title", "Play");
	}
	
	function playBtnClick() {
		draggingPlayer = false;
		if (mumbl.paused()) {
			changePlayIcon(true);
			mumbl.play();
			return;
		}
		changePlayIcon(false);
		mumbl.pause();
	}

	function changeLoopIcon(state) {
		if (state === 0) {
			loopBtn
				.removeClass(iconClass + "radio-off")
				.removeClass(iconClass + "bullet")
				.addClass(iconClass + "radio-on")
				.attr("title", "Not Looping");
			return;
		} else if (state === 1) {
			loopBtn
				.removeClass(iconClass + "radio-on")
				.removeClass(iconClass + "radio-off")
				.addClass(iconClass + "bullet")
				.attr("title", "Looping Track");
			return;
		}
		loopBtn
			.removeClass(iconClass + "radio-on")
			.removeClass(iconClass + "bullet")
			.addClass(iconClass + "radio-off")
			.attr("title", "Looping Playlist");
	}
	
	function loadBtnClick() {
		draggingPlayer = false;
		var looping = mumbl.loop();
		if ((looping -= 1) < 0) {
			looping = 2;
		}
		mumbl.loop(looping);
		changeLoopIcon(looping);
	}
	
	function changeShuffleIcon(state) {
		if (state) {
			shuffleBtn
				.removeClass(iconClass + "arrow-1-e")
				.addClass(iconClass + "shuffle")
				.attr("title", "Shuffle Off");
			return;
		} else {
			shuffleBtn
				.removeClass(iconClass + "shuffle")
				.addClass(iconClass + "arrow-1-e")
				.attr("title", "Shuffle On");
			return;
		}
	}
	
	function shuffleBtnClick () {
		draggingPlayer = false;
		var shuffling = !mumbl.shuffle();
		mumbl.shuffle(shuffling);
		changeShuffleIcon(shuffling);
	}
	
	$("#mumbl-next").click(nextBtnClick);
	$("#mumbl-prev").click(prevBtnClick);
	volBtn.click(volBtnClick);
	loopBtn.click(loadBtnClick);
	playBtn.click(playBtnClick);
	shuffleBtn.click(shuffleBtnClick);
	
	if (!mumbl.INTEGRATED) { // don't listen for this info if there's already a UI
		mumbl.addListener("position", function() {
			var position = mumbl.position();
			if (position !== lastPosition) {
				progress.progressbar("value", (position / duration * 100) || 0);
				lastPosition = position;
			}
			trackPosition.text(toMinsSecs(mumbl.position()));
		});
	
		mumbl.addListener("duration", function() {
			duration = mumbl.duration();
			trackDuration.text(toMinsSecs(duration));
		});
	
		mumbl.addListener("track", function() {
			trackTitle.text(playlist[mumbl.track()] + " - " + playlist.album + " - " + playlist.artist);
		});
	}
	
	mumbl.track(0);
}, window);
