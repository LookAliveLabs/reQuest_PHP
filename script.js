$(document).ready(function(){

	/* 
		APP VARIABLES 
	*/
	// App.popcorn = Popcorn('#video');
	App.video = {height: $('#video_container').height(),
					width: $('#video_container').width()};
	App.postObj = {source:[], srcFlash:""};
	App.currFocus = null;
	App.numEvents = 0;
	App.currEvent = null;
	App.Forms = [];
	App.frameDuration = (1/30); // guess frame rate initially;
	App.fonts = {};

	App.eventsCollection = new Events(); // initialize Events collection;
	App.tabsView = new Tabs({collection: App.eventsCollection}); // initialize tabs list view
	App.events = [];


	App.saved = true; // set saved = true initially
	App.eventsCollection.bind("add remove change", function(){
	  App.saved = false;
	});


	/*
		click logout -> reload the page
	*/
	$('.logout').click(function(){
		window.location.href = CONF['api_host'];
	});

	/*
		ADD EVENT - add an event to the video
	*/
	$('#add_event').click(function(){
		if(App.eventsCollection.length<6){
			App.events[App.numevents] = new Event({}, {collection:App.eventsCollection});
			if(App.eventsCollection.length == 6){
				$('#add_event').fadeOut();
			}
		}
	});

	/*
		ONUNLOAD - check if want to save before leaving
	*/
	window.onbeforeunload=function(){
		if(!App.saved){
			return 'You have some unsaved changes';
		}else{
			return null;
		}
		// if(r){
		// 	console.log(App.videoLink);
		// }else{
		// 	console.log('nope!');
		// }
	};
	

	$('#error_confirm').bind('click',function(){
		$('#error_container').fadeOut();
	});
	$('#client_name').focus(function(){
		$('#client_name').removeClass('empty');
	});
	$('#project_name').focus(function(){
		$('#project_name').removeClass('empty');
	});
	$('input').focus(function(){
		App.onTextInput = true;
	});
	$('input').blur(function(){
		App.onTextInput = false;
	});
	$('body').mouseup(function(){
		if('player' in App){
			App.player.onBar = false;
		}
	});

	/* 
		SUBMIT BUTTON - submit event information to the API
	*/
	$('#submit_events').click(function(){
		// reset all error indicators
		$('.event_form_handle').removeClass('error');
		$('input').removeClass('empty');
		var error = false;
		
		// validate each model
		App.eventsCollection.each(function(event){
			//push keyframes into model attributes
			event.set('keyframes', event.keyframes);
			event.set('hoverObj', event.hoverObj);
			event.set('customHover', event.customHover);

			if(!event.get('start')){ 
				error = true;
				$(event.formView.el).find('.starttime').addClass('empty');
				$(event.tabView.el).addClass('error');
			}
			if(!event.get('end') || event.get('end')<=event.get('start')){
				error = true;
				$(event.formView.el).find('.endtime').addClass('empty');
				$(event.tabView.el).addClass('error');
			}
			if(event.get('name')==''){
				error = true;
				$(event.formView.el).find('.elname').addClass('empty');
				$(event.tabView.el).addClass('error');
			}
		});
		
		App.postObj.elements = JSON.parse(JSON.stringify(App.eventsCollection.models));
		App.postObj.frameDuration = App.frameDuration;
		
		// if any fields are blank - send error alert
		if(error){
			$('#error_container').css('margin-left', ($('#page_container').width()-500)/2 + 'px')
								.html('You left come fields blank!<div id="error_confirm" class="button green">Give me a second chance</div>')
								.fadeIn();
			$('#error_confirm').bind('click',function(){
				$('#error_container').fadeOut();
			});
			return;
		}

		//send events to API 
		$.ajax({type:'POST',
			url: 'php/wrapVideo.php',
			dataType: "json",
			data: {myData:JSON.stringify(App.postObj)},
			success: function(res){
				// res = JSON.parse(res);
				App.saved = true;
				// console.log(res);
				console.log('link: '+ CONF['api_host']+ '/' + res.dirName);
				$('#output').attr('href', CONF['api_host'] + '/Projects/' + res.dirName).fadeIn();
				// $('#output').html('<a href="'+ CONF['api_host'] + '/Projects/' + res +'" target="_blank">LINK TO VIDEO</a>');
			},
			error: function(err){
				console.log(err);
			}
		});

	});
	
	$('#video_file').bind('change', function(){
		//display pink checkmark to the left
		$('#checkmark').fadeIn();
	});

	//keyup right/left/i/o
	$(document).keyup(function(e){
		if(!App.onTextInput){
			e.preventDefault(); e.stopPropagation();
			var cl = e.target.getAttribute('class');
			switch (e.which){
				case 37: // left arrow key
					clearInterval(App.leftKeyHold);

					if(App.shiftPressed){
						App.popcorn.currentTime(App.popcorn.currentTime() - 1);
					}else{
						App.popcorn.currentTime(App.popcorn.currentTime() - App.frameDuration);
					}
					break;
				case 39: // right arrow key
					clearInterval(App.rightKeyHold);

					if(App.shiftPressed){
						App.popcorn.currentTime(App.popcorn.currentTime() + 1);
					}else{
						App.popcorn.currentTime(App.popcorn.currentTime() + App.frameDuration);
					}

					break;
				case 73: // 'i' key
					if(App.shiftPressed){
						App.popcorn.currentTime(App.currEvent.get('start'));
					}else{
						if(!App.currEvent.get('afx')){
							App.currEvent.set('start', roundTime(App.popcorn.duration() * $('#boxAtEnd').position().left / $('#defaultBar').width()) ); // calculate time with 3 decimal points
						}
					}
					break;
				case 79: // 'o' key
					if(App.shiftPressed){
						App.popcorn.currentTime(App.currEvent.get('end'));
					}else{
						if(!App.currEvent.get('afx')){
							App.currEvent.set('end', roundTime(App.popcorn.duration() * $('#boxAtEnd').position().left / $('#defaultBar').width()) ); // calculate time with 3 decimal points
						}
					}
					break;
				case 16: // shift key
					App.shiftPressed = false;
					break;
			}
		}
	});
	//keydown right/left
	$(document).keydown(function(e){
		
		if(!App.onTextInput){
			e.preventDefault(); e.stopPropagation();
			switch (e.which){
				case 37: // left arrow key
					clearInterval(App.leftKeyHold);
					// start advancing keyframes
					App.leftKeyHold = setInterval(function(){
						App.popcorn.currentTime(App.popcorn.currentTime() - App.frameDuration);
					},App.frameDuration*1000);
					break;
				case 39: // right arrow key
					clearInterval(App.rightKeyHold);
					// start advancing keyframes
					App.rightKeyHold = setInterval(function(){
						App.popcorn.currentTime(App.popcorn.currentTime() + App.frameDuration);
					},App.frameDuration*1000);
					break;
				case 16: // shift key
					App.shiftPressed = true;
					break;
			}
		}
	});


	function checkExistence(){
		if($('#client_name').val()!="" && $('#project_name').val()!=""){
			App.clientName = $('#client_name').val();
			App.projectName = $('#project_name').val();
			$.ajax({type:'POST',
					// url: CONF['api_host'] + '/checkExistence',
					url: 'php/checkExistence.php',
					data: ({clientName: $('#client_name').val(), projectName: $('#project_name').val()}),
					success: function(res){
						res = JSON.parse(res);
						if(res.exists){
							$('#error_container').css({'margin-left': ($('#page_container').width()-600)/2 + 'px', width: '500px'})
								.html('Project '+ App.clientName +'/'+App.projectName+' already exists. Would you like to edit it?<div id="load_project" class="button green">yes</div><div id="error_confirm" class="button green">No</div>')
								.fadeIn();
							$('#error_confirm').bind('click',function(){
								$('#error_container').fadeOut();
							});
							$('#load_project').bind('click',function(){
								// load the project
								loadProject(res);
							});
							return;
						}
					},
					error: function(err){
						console.log(err);
					}
				});
		}
	}
	/*
		CHECK EXISTENCE OF PREVIOUS PROJECT
	*/
	$('#client_name').blur(function(){
		checkExistence();
	});
	$('#project_name').blur(function(){
		checkExistence();
	});


	/* 
		UPLOAD VIDEO FILE FUNCTION 
	*/
	$('#submit_video').bind('click', function(e){
		e.preventDefault(); e.stopPropagation();

		App.clientName = $('#client_name').val();
		App.projectName = $('#project_name').val();

		var error = false;
		if(!App.clientName){
			$('#client_name').addClass('empty');
			error = true;
		}
		if(!App.projectName){
			$('#project_name').addClass('empty');
			error = true;
		} 

		if(error){
			$('#error_container').css({'margin-left': ($('#page_container').width()-500)/2 + 'px', width:'400px'})
								.html('You left come fields blank!<div id="error_confirm" class="button green">Give me a second chance</div>')
								.fadeIn();
			$('#error_confirm').bind('click',function(){
				$('#error_container').fadeOut();
			});
			return;
		}

		// initalize formData - to send to server
		var formData = new FormData();
		formData.append('clientName', App.clientName);
		formData.append('projectName', App.projectName);

		// initalize http request
		var xhr = new XMLHttpRequest();

		// check what type of link was provided
		var link = $('#video_link').val();
		var file = $('#video_file').val();

		if(!link && !file){
			error = true;
			// prompt user to enter file link
			$('#error_container').css({'margin-left': ($('#page_container').width()-500)/2 + 'px', width:'400px'})
				.html('Please select a video file!<div id="error_confirm" class="button green">Give me a second chance</div>')
				.fadeIn();
			$('#error_confirm').bind('click',function(){
				$('#error_container').fadeOut();
			});
			return;

		}else if(link){
			if(link.indexOf('youtube.com')!=-1){ // this is a youtube link
				// get youtube id from link url
				var regexp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
				var yt_id = link.match(regexp)[1];
				link = "www.youtube.com/v/"+yt_id+"?fs=0&rel=0&autohide=0";
				
				App.postObj.videoType = 'youtube';
				App.postObj.videoLink = link;
				// App.postObj.youtubeSrc = link;
			}else if(link.indexOf('.mp4'!=-1)){ // this is a link to an mp4

				App.postObj.videoType = 'link';
				App.postObj.videoLink = link;
				App.postObj.source.push({src: link, type: "video/"+link.split('.').pop()});
			}
		}else if(file){
			// if no link provided - check file selection
			var file = document.getElementById('video_file').files[0];
			formData.append('myFile', file);
			formData.append('extFile', file.name.split('.').pop());

			App.postObj.videoType = 'file';
			// App.postObj.videoLink = 'video.mp4';
			App.postObj.source.push({src: 'video.'+file.name.split('.').pop(), type: file.type });

			// show progress bar
			xhr.upload.onprogress = function(e) {
			  if (e.lengthComputable) {
			    var width = 295 * (e.loaded / e.total);
			    $('#progress_completed').css('width', width + 'px');
			  }
			};
		}

		if(!error){

		// Send http request to server
		xhr.open('POST', 'php/createProject.php', true);

		xhr.onreadystatechange = function (aEvt) {
		  if (xhr.readyState == 4) {
		     if(xhr.status == 200){

		     	var data = JSON.parse(this.responseText);
		     	console.log(data);
		     	if(data.exists){
		     		// THIS PROJECT ALREADY EXISTS!!
		     		$('#error_container').css({'margin-left': ($('#page_container').width()-600)/2 + 'px', width: '500px'})
								.html('Project '+ App.clientName +'/'+App.projectName+' already exists. Would you like to edit it?<div id="load_project" class="button green">yes</div><div id="error_confirm" class="button green">No</div>')
								.fadeIn();
					$('#error_confirm').bind('click',function(){
						$('#error_container').fadeOut();
					});
				    $('#video_container').html(''); // clear video container

				 	/* 
						LOAD PROJECT - load a previously started project
					*/
					$('#load_project').bind("click", function(){
						loadProject(data);
					});
		     	}else{

			     	// store path in App.postObj
					App.postObj.dirName = data.path;

					
					
					//initialize popcorn
					if(App.postObj.videoType == 'file'){
						// App.player = new HtmlPlayer({src_mp4: CONF['api_host'] +"/Projects/"+ App.postObj.dirName + "/video.mp4"});
						App.player = new HtmlPlayer({type:"file", src: CONF['api_host'] +"/Projects/"+ App.postObj.dirName + "/"+App.postObj.source[0].src});
					}else if(App.postObj.videoType == 'youtube'){
						// App.player = new HtmlPlayer({src_youtube: App.postObj.videoLink+"&controls=0"});
						App.player = new HtmlPlayer({type:'youtube', src: App.postObj.videoLink+"&controls=0"});
					}else if(App.postObj.videoType == 'link'){
						// App.player = new HtmlPlayer({src_mp4: App.postObj.videoLink});
						App.player = new HtmlPlayer({type: "link", src: App.postObj.source[0].src});
					}

					// add first event:
					App.popcorn.on('canplaythrough', function(e){
						App.events[0] = new Event({}, {collection:App.eventsCollection});
						App.popcorn.play(); App.popcorn.pause();
					});

					// hide upload window, show video screen
					$('#header').animate({top: '-130px'}, 800);
					$('#error_container').fadeOut();
					$('#input_container').fadeOut(500, function(){
						$('#tool_container').fadeIn(500);
						$('#header .menu').fadeIn(500);
					});
				}
			  }
		   }
	    }


		xhr.send(formData);
		}
	});

});
