/* 
	HTML PLAYER - HTML video player view.
		Initialize with options = {src_mp4: pathToVid}
*/
var HtmlPlayer = Backbone.View.extend({
	el: '#video_container',
	events: {
		"click #playButton": "playOrPause",
		"click #defaultBar": "clickedBar",
		"click #audioIcon": "muteToggle",

		"mousedown #defaultBar": "barMousedown",
		"mousemove #defaultBar": "barMousemove",
		"mouseup #defaultBar": "barMouseup",
		"mouseout #defaultBar": "barMouseout",
		"mouseover #defaultBar": "barMouseover"

	},
	initialize: function(options){
		_.bindAll(this, 'renderHtml', 'setup', 'playOrPause', 'update', 'clickedBar', 'muteToggle', 'formatTime', 'barMousedown', 'barMousemove', 'barMouseup', 'barMouseout', 'barMouseover');

		// set variables - heght and width of player
		this.width = $('#video_container').width();
	    this.height = $('#video_container').height();

		// render on init
		// if(options.src_mp4){
		if(options.type == "file" || options.type == "link"){
			// render html player
			this.renderHtml(options.src);
		}else if(options.type=="youtube"){
			// render youtube player
			this.renderYoutube(options.src);
		}
			
	},
	renderHtml: function(src){
		var self = this;
		dust.render("videoHtml", {src: src}, function(err, out) {
            if(!err) {
                $(self.el).html(out);
                // Raphael paper container for raphael elements
                App.paper = new Raphael('afxEl', $('#video_container').width(), $('#video_container').height());
                
                // setup raphael custom Attributes for rectangles - centerX and centerY - allows us to define rectangle location using center point, not top left corner. This is the info that comes out of after effects
                App.paper.customAttributes.centerX = function (num) {
					var width = this.attr('width');
					return {x: num - width/2};
			    };
			    App.paper.customAttributes.centerY = function (num) {
					var height = this.attr('height');
					return {y: num - height/2};
			    };

                self.video = document.getElementById('video');

                // change dimensions - > bottom bar is 24px. Dont want bottom bar to overlap with the video
				$('#video_container').height(self.height+24);
				$('#video').height(self.height);

                App.popcorn = Popcorn('#video');
                self.buffer();
                self.setup();

            } else {
                return console.log(err);
            }
        });
	},
	renderYoutube: function(src_youtube){
		var self = this;

		App.popcorn = Popcorn.youtube(this.el, src_youtube);
		this.video = {duration:App.popcorn.duration()};
		this.barLength = $(this.el).width();

		// append (1) invisible div on top of iframe 
		//        (2) in and out markers on top of the iframe
		$(self.el).append('<div id="afxEl"></div>\
							<div id="bottomBar">\
							    <div id="playButton">\
							        <div id="playButtonTriangle" class="pause_play"></div>\
							        <div id="pauseButton" class="pause_play"></div>\
							    </div>\
							    <span id="current_time">00:00</span>\
							    <div id="defaultBar" class="playBar">\
							       <div id="progressBar"></div>\
							       <div id="boxAtEnd"></div>\
							       <div id="startPoint" class="bracket"></div>\
							       <div id="endPoint" class="bracket"></div>\
							       <div class="clear"></div>\
									<div id="tooltip">\
							          <div id="t1">00:58</div>\
							          <div id="t2"></div>\
							        </div>\
							    </div>\
							    <span id="duration">00:00</span>\
							    <div id="audioIcon"></div>\
						    <div class="clear"></div>\
						</div>');
		// Raphael paper container for raphael elements
        App.paper = new Raphael('afxEl', $('#video_container').width(), $('#video_container').height());
        
        // setup raphael custom Attributes for rectangles - centerX and centerY - allows us to define rectangle location using center point, not top left corner. This is the info that comes out of after effects
        App.paper.customAttributes.centerX = function (num) {
			var width = this.attr('width');
			return {x: num - width/2};
	    };
	    App.paper.customAttributes.centerY = function (num) {
			var height = this.attr('height');
			return {y: num - height/2};
	    };

	    // change dimensions - > bottom bar is 24px. Dont want bottom bar to overlap with the video
		$('#video_container').height(self.height+24);
		$('#video').height(self.height);

		// var currentTime = App.popcorn.currentTime();
		// App.popcorn.on('timeupdate', function(e){
		// 	if(App.popcorn.currentTime() && App.popcorn.currentTime()!= currentTime && App.popcorn.paused()){ // only fire when video is not playing, and time actually did change
		// 		currentTime = App.popcorn.currentTime();
		// 		// new keyframes version:
		// 		var el = $(App.currEvent.formView.dummy);
		// 		var keyframes = App.currEvent.keyframes;
		// 		var l = keyframes.time.length-1;
		// 		var t = roundTime(App.popcorn.currentTime());
		// 		// if(t<App.currEvent.get('start') || t>App.currEvent.get('end')){
		// 		// 	el.css('display', 'none');
		// 		if(keyframes.time.length > 0 && !App.settingLimits){
		// 			// 1) place dummy el in correct position
		// 			if(t < keyframes.time[0]){
		// 				el.css('display', 'none');
		// 			}else if(t > keyframes.time[l]){
		// 				el.css('display', 'none');
		// 			}
		// 			// else - intrapolate, get time,x,y,w,h values
		// 			else{
		// 				var pos = intrapolate(t, keyframes);
		// 				el.css({display: 'block',
		// 						left: pos.x+'%',
		// 						top: pos.y+'%',
		// 						width: pos.w+'%',
		// 						height: pos.h+'%'});

		// 			}
		// 		}
		// 	}
		// });

		self.setup();

	},
	buffer: function(){
		//monitor video buffering
		var self = this;
	    // store the returned timeRanges object as we use it more than once
	    App.popcorn.on('progress', function(){
	    	// console.log('start progress');
	    		if(App.popcorn.buffered().length>0){
				    // set buffer-bar length to 100-buffered%
				    var width = 100 - 100*(App.popcorn.buffered().end(0)/App.popcorn.duration());
				    $('#bufferBar').css('width', width+'%');
			    }
	    });
	    
	},
	animate: function(){
		if(!App.currEvent.get('afx')){
			var el = $(App.currEvent.formView.dummy);
			// App.currEvent.int = setInterval(function(){
				var keyframes = App.currEvent.keyframes;
				var l = keyframes.time.length-1;
				var t = roundTime(App.popcorn.currentTime());
				if(keyframes.time.length > 0){
					// 1) place dummy el in correct position
					if(t < keyframes.time[0]){
						el.css('display', 'none');
					}else if(t > keyframes.time[l]){
						el.css('display', 'none');
					}
					// else - intrapolate, get time,x,y,w,h values
					else{
						var pos = intrapolate(t, keyframes);
						el.css({display: 'block',
								left: pos.x+'%',
								top: pos.y+'%',
								width: pos.w+'%',
								height: pos.h+'%'});

					}
				}
			// }, 5); // run every 10msec;
		}else{// animate afx generated element, unless its static
			var obj = App.currEvent.formView.raphael; //raphael object
			var el = $(App.currEvent.formView.dummy); // raphael object DOM node

			if(App.currEvent.get('attr')){
				var t = roundTime(App.popcorn.currentTime()); // currentTime
				if(t < App.currEvent.get('start') || t > App.currEvent.get('end')){
					el.css('display','none');
				}else{
					el.css('display','block');
				}

			}else{
			
				var keyframes = App.currEvent.keyframes; //keyframes

				var t = roundTime(App.popcorn.currentTime()); // currentTime
				var frameId = Math.floor(App.popcorn.currentTime()/App.frameDuration); //currentFrame

				if(!(frameId in keyframes)){
				// if(t<= App.currEvent.get('start') || t>=App.currEvent.get('end')){
					el.css('display','none');
				}else{
					// generate raphael path. Don't need to intrapolate here becuase we have data for each frame
					kf = keyframes[frameId];
					var myPath = 'M'+ kf.x[0] +','+ kf.y[0];
					for(var j=1; j<kf.x.length; j++){
						myPath += 'C'+kf.outTanX[j-1]+' '+kf.outTanY[j-1]+' '+kf.inTanX[j]+' '+kf.inTanY[j]+' '+ kf.x[j] + ' ' + kf.y[j];
					}
					// myPath += 'z';
					myPath+= 'C'+kf.outTanX[j-1]+' '+kf.outTanY[j-1]+' '+kf.inTanX[0]+' '+kf.inTanY[0]+' '+ kf.x[0] + ' ' + kf.y[0];

					el.css('display','block');
					obj.animate({  
					    path: myPath,
					    'fill-opacity': kf.opacity,
					    fill: kf.fill
					}, 1, 'linear', function(){
					});
				}
			}

		}
	},
	setup: function(){
		var self = this;

		// video is initially paused
		this.paused = true;

		// add raphael graphics
        var playButtonTriangleSVG=["playButtonTriangle",20,20,{"fill":"#FF0056","stroke":"none","path":"M2,0.292 19.063,10.141 2,19.995 z","type":"path"}];
		var pauseButtonSVG=["pauseButton",20,20,{"type":"rect","x":6.25,"width":2.456,"y":2,"fill":"#FF0056","stroke":"none","height":16.375},{"type":"rect","x":11.162,"width":2.457,"y":2,"fill":"#FF0056","stroke":"none","height":16.375}];
		var audioSVG=["audioIcon",20,20,{"fill":"#000","stroke":"#000000","path":"M10.5,13.86 2.356,9.158 10.5,4.457 z","type":"path"},{"type":"rect","x":1.5,"width":5,"y":6.5,"fill":"#000","stroke":"#000000","height":5},{"fill":"#000","stroke":"#000000","path":"M6.5,11.5h-5v-5h5V11.5z M1.5,11.5h5v-5h-5V11.5z","type":"path"},{"fill":"#000","stroke":"none","path":"M14.421,14.234c0.359-0.359,0.682-0.76,0.963-1.185c0.274-0.416,0.494-0.86,0.681-1.321 c0.168-0.414,0.293-0.845,0.376-1.284c0.092-0.478,0.142-0.966,0.14-1.453c-0.002-0.486-0.058-0.975-0.151-1.452 c-0.088-0.438-0.219-0.867-0.39-1.28c-0.187-0.448-0.402-0.878-0.671-1.282c-0.276-0.417-0.595-0.809-0.947-1.163 c-0.209-0.209-0.56-0.209-0.769,0c-0.209,0.209-0.209,0.559,0,0.768c0.207,0.207,0.4,0.427,0.58,0.658 c-0.028-0.037-0.057-0.073-0.085-0.11c0.357,0.464,0.655,0.972,0.884,1.51c-0.019-0.043-0.037-0.086-0.055-0.129 c0.235,0.559,0.396,1.149,0.477,1.75c-0.006-0.048-0.013-0.096-0.02-0.145c0.08,0.602,0.08,1.213,0,1.815 c0.007-0.048,0.014-0.096,0.02-0.144c-0.081,0.602-0.241,1.191-0.477,1.75c0.018-0.043,0.036-0.086,0.055-0.13 c-0.229,0.539-0.526,1.047-0.884,1.511c0.028-0.037,0.057-0.074,0.085-0.11c-0.18,0.231-0.373,0.45-0.58,0.657 c-0.209,0.21-0.209,0.559,0,0.768C13.861,14.444,14.212,14.445,14.421,14.234L14.421,14.234z","type":"path"},{"fill":"#000","stroke":"none","path":"M16.983,15.391c0.43-0.432,0.816-0.91,1.152-1.418c0.329-0.498,0.591-1.031,0.814-1.583 c0.201-0.495,0.352-1.011,0.451-1.536c0.109-0.572,0.169-1.156,0.166-1.739c-0.002-0.583-0.067-1.167-0.182-1.738 c-0.104-0.524-0.261-1.038-0.466-1.532c-0.223-0.536-0.48-1.051-0.803-1.535c-0.33-0.499-0.712-0.968-1.134-1.391 c-0.251-0.251-0.669-0.25-0.919,0c-0.251,0.25-0.251,0.668,0,0.918c0.247,0.248,0.479,0.511,0.693,0.788 c-0.034-0.044-0.068-0.088-0.102-0.131c0.428,0.555,0.784,1.163,1.058,1.808c-0.022-0.052-0.044-0.104-0.065-0.155 c0.282,0.669,0.474,1.375,0.57,2.095c-0.007-0.058-0.015-0.115-0.022-0.173c0.096,0.721,0.096,1.452,0,2.172 c0.008-0.058,0.016-0.115,0.022-0.173c-0.097,0.72-0.288,1.426-0.57,2.095c0.021-0.052,0.043-0.103,0.065-0.155 c-0.273,0.646-0.63,1.254-1.058,1.809c0.033-0.045,0.067-0.088,0.102-0.133c-0.215,0.277-0.446,0.541-0.693,0.788 c-0.251,0.251-0.251,0.669,0,0.919C16.314,15.641,16.732,15.641,16.983,15.391L16.983,15.391z","type":"path"},{"fill":"#000","stroke":"none","path":"M12.519,12.836c0.253-0.254,0.479-0.535,0.677-0.834c0.192-0.291,0.347-0.604,0.478-0.928 c0.118-0.291,0.206-0.594,0.265-0.902c0.064-0.335,0.1-0.679,0.098-1.021c-0.001-0.342-0.04-0.685-0.106-1.02 c-0.061-0.308-0.153-0.609-0.273-0.899c-0.13-0.315-0.282-0.617-0.471-0.901c-0.194-0.292-0.418-0.568-0.666-0.817 c-0.147-0.147-0.393-0.146-0.54,0c-0.146,0.147-0.146,0.393,0,0.54c0.146,0.146,0.281,0.3,0.408,0.462 c-0.021-0.026-0.041-0.051-0.061-0.077c0.252,0.326,0.461,0.683,0.621,1.061c-0.014-0.03-0.025-0.061-0.039-0.091 c0.166,0.393,0.279,0.807,0.336,1.23c-0.005-0.034-0.01-0.067-0.014-0.102c0.056,0.423,0.056,0.852,0,1.275 c0.004-0.034,0.009-0.067,0.014-0.101c-0.057,0.423-0.17,0.836-0.336,1.23c0.014-0.031,0.025-0.061,0.039-0.092 c-0.16,0.379-0.369,0.736-0.621,1.062c0.02-0.026,0.04-0.052,0.061-0.077c-0.127,0.162-0.263,0.316-0.408,0.462 c-0.146,0.147-0.146,0.393,0,0.54C12.126,12.982,12.371,12.982,12.519,12.836L12.519,12.836z","type":"path"}];

		var playButtonTriangle = Raphael(playButtonTriangleSVG);
	    var pauseButton = Raphael(pauseButtonSVG);
	    var muteButton = Raphael(audioSVG);

	    App.popcorn.on('ended', function(){
	    	self.video.ended = true;
	    });
	    App.popcorn.on('playing', function(){
	    	self.video.ended = false;
	    	App.currEvent.int = setInterval(function(){
	    		self.animate();
	    	},App.frameDuration*1000); // interval time should equal frame duration, so animate every frame
	    });
	    App.popcorn.on('pause', function(){
			clearInterval(App.currEvent.int);
		});
		/*
			Listen to 'seeking' event and update start and end times based on seeked location
		*/
		// App.popcorn.on('seeking', function(e){
		// 	if(App.currFocus){

		// 		self.animate();
		// 	}
		// });
		App.popcorn.on('seeked', function(e){
			if(App.currFocus){

				self.animate();
			}
		});

        // draggable time bar
        $('#boxAtEnd').click(function(e){
        	e.preventDefault(); e.stopPropagation();
        }).draggable({
	        "scroll":false,
	        containment: "parent",
	        axis: 'x',
	        start: function(){
	        	// unfocus input fields
	            App.currEvent.formView.$('.starttime').blur().removeClass('selected');
	            App.currEvent.formView.$('.endtime').blur().removeClass('selected');
	        },
	        drag: function(event, ui){
	            var newtime=ui.position.left*App.popcorn.duration()/$('#defaultBar').width();
	            App.popcorn.currentTime(newtime);
	            $("#current_time").html(self.formatTime(newtime));
	            $('#progressBar').css('width', ui.position.left+'px');
	        }
	    });

        // bind timeupdate
	    App.popcorn.on("timeupdate", function(){
	    	// update current time display
	    	$("#current_time").html(self.formatTime(App.popcorn.currentTime()));
	    	// update progress bar
	    	// if(!App.settingLimits){
		    	// $('#progressBar').css('width', '0px');
        		// $('#boxAtEnd').css('left', App.player.barLength*App.popcorn.currentTime()/App.popcorn.duration()+'px');
        		$('#boxAtEnd').css('left', 100*App.popcorn.currentTime()/App.popcorn.duration()+'%');
        	// }


	    });

		App.popcorn.on('canplaythrough', function(e){
			e.preventDefault(); e.stopPropagation();
			$("#duration").html(self.formatTime(App.popcorn.duration()));
	        self.barLength = $('#defaultBar').width();
		});

	    // draggable start and end points
	    $('#startPoint').bind('click', function(e){
	    	e.preventDefault(); e.stopPropagation();
	    	// set video to this position
	    	var time=$('#startPoint').position().left*App.popcorn.duration()/$('#defaultBar').width();
	    	App.popcorn.currentTime(time);
	    }).mouseover(function(e){
	    	$('#t1').html(self.formatTime(App.currEvent.get('start')));
	        $('#tooltip').css({'left': (e.pageX-$('#defaultBar').offset().left-37)+'px',
	            				'display': 'block'});
	    }).mouseout(function(){
	    	$('#tooltip').css({'display':'none'});
	    }).draggable({
	        "scroll":false,
	        containment: "parent",
	        axis: 'x',
	        start: function(){
	        	App.settingLimits = true;
	        	// mark start field as selected
	            App.currEvent.formView.$('.starttime').addClass('selected');
	            App.currEvent.formView.$('.endtime').removeClass('selected');
	            //current focus
	            App.currFocus = App.currEvent.formView.$('.starttime');
	        },
	        drag: function(event, ui){
	            var startTime=roundTime(ui.position.left*App.popcorn.duration()/$('#defaultBar').width());
	            //update start time input and the current model
	            App.currEvent.formView.$('.starttime').val(startTime);
	            App.currEvent.set({start: startTime});
	            // adjust video position
	            App.popcorn.currentTime(startTime);

	            $('#t1').html(self.formatTime(startTime));
	            $('#tooltip').css({'left': (ui.position.left-37)+'px',
	            					'display': 'block'});

	        },
	        stop: function(){
	        	App.settingLimits = false;
	        	App.currEvent.formView.setFirstKeyframe();
	        	$('#tooltip').css({'display':'none'});
	        }
	    });

	    $('#endPoint').bind('click', function(e){
	    	e.preventDefault(); e.stopPropagation();
	    	// set video to this position
	    	var time=$('#endPoint').position().left*App.popcorn.duration()/$('#defaultBar').width();
	    	App.popcorn.currentTime(time);
	    }).mouseover(function(e){
	    	$('#t1').html(self.formatTime(App.currEvent.get('end')));
	        $('#tooltip').css({'left': (e.pageX-$('#defaultBar').offset().left-37)+'px',
	            				'display': 'block'});
	    }).mouseout(function(){
	    	$('#tooltip').css({'display':'none'});
	    }).draggable({
	        "scroll":false,
	        containment: "parent",
	        axis: 'x',
	        start: function(){
	        	App.settingLimits = true;
	        	// mark end field as selected
	            App.currEvent.formView.$('.endtime').addClass('selected');
	            App.currEvent.formView.$('.starttime').removeClass('selected');
	            //current focus
	            App.currFocus = App.currEvent.formView.$('.endtime');
	        },
	        drag: function(event, ui){
	            var endTime=ui.position.left*App.popcorn.duration()/$('#defaultBar').width();
	            //update end time input and the current model
	            App.currEvent.formView.$('.endtime').val(Math.round(endTime*1000)/1000);
	            App.currEvent.set({end: Math.round(endTime*1000)/1000});
	            // adjust video position
	           	App.popcorn.currentTime(endTime);

	           	$('#t1').html(self.formatTime(endTime));
	            $('#tooltip').css({'left': (ui.position.left-37)+'px',
	            					'display': 'block'});
	        },
	        stop: function(){
	        	App.settingLimits = false;
	        	App.currEvent.formView.setLastKeyframe();
	        	$('#tooltip').css({'display':'none'});
	        }
	    });

	},
	// play button
	playOrPause: function(e){
		e.preventDefault(); e.stopPropagation();
		// $("#duration").html(this.formatTime(App.popcorn.duration()));
	    if(!App.popcorn.paused() && !this.video.ended){
	        // this.video.pause(); // for html only
	        App.popcorn.pause();
	        this.paused = true;
	        $("#playButtonTriangle").show();
	        $("#pauseButton").hide();
	        window.clearInterval(this.updateBar);
	    } else{
	        // this.video.play(); // for html only
	        App.popcorn.play();
	        this.paused = false;
	        $("#playButtonTriangle").hide();
	        $("#pauseButton").show();
	        this.updateBar=setInterval(this.update, 100);
	    }

	    this.onBar = false;
	},
	update: function(){
	    if(!this.video.ended){
	        var left = 100*App.popcorn.currentTime()/App.popcorn.duration();
	        $('#progressBar').css('width', left+'%');
	        $('#boxAtEnd').css('left', left+'%');
	    } else{
	        $('#progressBar').css('width', '0px');
	        $('#boxAtEnd').css('left', '0px');
	        
	        $("#pauseButton").hide();
	        $("#playButtonTriangle").show();

	        window.clearInterval(this.updateBar);
	    }
	},
	clickedBar: function(event){
	},
	muteToggle: function(){
        if(this.video.muted) {
            this.video.muted = false;
            $("#audioIcon").css({ opacity: "1.0" }); 
        } else {
            this.video.muted = true;
        	$("#audioIcon").css({ opacity: ".3" });  
        }  
    },
    formatTime: function(seconds) {
	    var seconds = Math.round(seconds);
	    var minutes = Math.floor(seconds / 60);
	    seconds = Math.floor(seconds % 60);
	    minutes = (minutes >= 10) ? minutes : "0" + minutes;
	    seconds = (seconds >= 10) ? seconds : "0" + seconds;
	    return minutes + ":" + seconds;
	},
	barMousedown: function(e){
		if(e.target.id!='boxAtEnd'){
			e.preventDefault(); e.stopPropagation();
			App.popcorn.currentTime(App.popcorn.duration() * e.offsetX / $('#defaultBar').width());
			this.onBar = true;
			this.mouseStartOffset = e.offsetX;
			this.mouseStartPos = e.clientX;
		}
	},
	barMousemove: function(e){
		if(this.onBar){
			App.popcorn.currentTime(App.popcorn.duration() * (this.mouseStartOffset+e.clientX - this.mouseStartPos) / $('#defaultBar').width());
		}
	},
	barMouseup: function(e){
		this.onBar = false;
	},
	barMouseout: function(e){
		// this.onBar = false;
	},
	barMouseover: function(e){
		// this.onBar = true;
	}
});


/* 
	YOUTUBE PLAYER - YOUTUBE video player view.
		Initialize with options = {src_mp4: pathToVid}
*/
var YoutubePlayer = Backbone.View.extend({
	el: '#video_container',
	initialize: function(options){
		this.render(options.src_youtube);
	},
	render: function(src_youtube){
		var self = this;
		// create a popcorn youtube instance
		App.popcorn = Popcorn.youtube(this.el,src_youtube+'controls=0');
		this.video = {duration:App.popcorn.duration};
		this.barLength = $(this.el).width();

		// append (1) invisible div on top of iframe 
		//        (2) in and out markers on top of the iframe
		$(this.el).append('<div id="youtube_cover"></div><div id="youtube_time"></div><div id="startPoint" class="bracket_youtube"></div><div id="endPoint" class="bracket_youtube"></div>');
		
		// draggable start and end points
	    $('#startPoint').bind('click', function(e){
	    	e.preventDefault(); e.stopPropagation();
	    	// set video to this position
	    	var time=$('#startPoint').position().left*self.video.duration/$('#defaultBar').width();
	    	self.video.currentTime = time;
	    }).draggable({
	        "scroll":false,
	        containment: "parent",
	        axis: 'x',
	        start: function(){
	        	App.settingLimits = true;
	        	// mark start field as selected
	            App.currEvent.formView.$('.starttime').addClass('selected');
	            App.currEvent.formView.$('.endtime').removeClass('selected');
	            //current focus
	            App.currFocus = App.currEvent.formView.$('.starttime');
	        },
	        drag: function(event, ui){
	            var startTime=ui.position.left*self.video.duration/App.player.barLength;
	            //update start time input and the current model
	            App.currEvent.formView.$('.starttime').val(Math.round(startTime*1000)/1000);
	            App.currEvent.set({start: Math.round(startTime*1000)/1000});
	            // adjust video position
	            self.video.currentTime = startTime;
	        },
	        stop: function(){
	        	App.settingLimits = false;
	        	App.currEvent.formView.setFirstKeyframe();
	        }
	    });
	    $('#endPoint').bind('click', function(e){
	    	e.preventDefault(); e.stopPropagation();
	    	// set video to this position
	    	var time=$('#endPoint').position().left*self.video.duration/App.player.barLength;
	    	self.video.currentTime = time;
	    }).draggable({
	        "scroll":false,
	        containment: "parent",
	        axis: 'x',
	        start: function(){
	        	App.settingLimits = true;
	        	// mark end field as selected
	            App.currEvent.formView.$('.endtime').addClass('selected');
	            App.currEvent.formView.$('.starttime').removeClass('selected');
	            //current focus
	            App.currFocus = App.currEvent.formView.$('.endtime');
	        },
	        drag: function(event, ui){
	            var endTime=ui.position.left*self.video.duration/App.player.barLength;
	            //update end time input and the current model
	            App.currEvent.formView.$('.endtime').val(Math.round(endTime*1000)/1000);
	            App.currEvent.set({end: Math.round(endTime*1000)/1000});
	            // adjust video position
	            self.video.currentTime = endTime;
	        },
	        stop: function(){
	        	App.settingLimits = false;
	        	App.currEvent.formView.setLastKeyframe();
	        }
	    });
	}
});

