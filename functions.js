/*Functions*/
	function insert(element, array) {
	  array.push(element);
	  array.sort(function(a,b) {return a-b});
	  return array.indexOf(element);
	}

	function RaphaelToScale(svg, position){
		var el = document.getElementById(svg[0]);
		el.innerHTML = ''; //clear element
		var width = $(el).css('width');
		var height = $(el).css('height');
		var scaleX = parseFloat($(el).css('width'))/svg[1];
		var scaleY = parseFloat($(el).css('height'))/svg[2];
		var newHeight = svg[2]*scaleX;
		var paper = Raphael(svg[0], width, newHeight);
		// paper.canvas.className.baseVal="raphaelPaper"; // give this svg an id
		
		var paths = svg.slice(3, svg.length);
		paper.add(paths).transform("S"+scaleX+","+scaleX+",0,0");
		if(position){
			el.style.top = ($(el.parentNode).height() - newHeight)/2;
			el.style.height = newHeight+'px';
		}

		var out = {paper:paper, scale:scaleX};
		return out;
	}
	
	function intrapolate(t, keyframes){
		if(keyframes.time.indexOf(t) == -1){
			// find the closest keyframes
			var idx = 0;
			for(var i = 0; i<keyframes.time.length; i++){
				if((keyframes.time[i]-t)>0){
					idx = i;
					break;
				}
			}
			idx = idx-1;
			// intrapolate
			var fraction = (t-keyframes.time[idx])/(keyframes.time[idx+1] - keyframes.time[idx]);
			var pos = { x: keyframes.x[idx] + fraction*(keyframes.x[idx+1] - keyframes.x[idx]),
						y: keyframes.y[idx] + fraction*(keyframes.y[idx+1] - keyframes.y[idx]),
						w: keyframes.w[idx] + fraction*(keyframes.w[idx+1] - keyframes.w[idx]),
						h: keyframes.h[idx] + fraction*(keyframes.h[idx+1] - keyframes.h[idx])};

		}else{
			// this is one of the keyframes
			var idx = keyframes.time.indexOf(t);
			var pos = { x: keyframes.x[idx],
						y: keyframes.y[idx],
						w: keyframes.w[idx],
						h: keyframes.h[idx]};
		}
		
		return pos;
	}

	function roundTime(t){
		return Math.round(t*1000)/1000;
	}

	function loadProject(data){
		// // (1) initialize player
		// if(data.videoType=="file"){
		// 	App.player = new HtmlPlayer({src: "/Projects/"+ data.dirName +"/"+ data.videoLink});
		// }else if(data.videoType=="link_mp4"){
		// 	App.player = new HtmlPlayer({src_mp4: data.videoLink});
		// }else if(data.videoType =="link_youtube"){
		// 	App.player = new HtmlPlayer({src_youtube: data.videoLink+"&controls=0"});
		// }

		if(data.videoType == 'file'){
			App.player = new HtmlPlayer({type:"file", src: CONF['api_host'] +"/Projects/"+ data.dirName + "/"+data.source[0].src});
		}else if(data.videoType == 'youtube'){
			App.player = new HtmlPlayer({type:'youtube', src: data.videoLink+"&controls=0"});
		}else if(data.videoType == 'link'){
			App.player = new HtmlPlayer({type: "link", src: data.source[0].src});
		}

		// (2) store all previous data in App.postObj
		App.postObj = data; 
		App.frameDuration = data.frameDuration;

		// (3) populate events
		App.popcorn.on('canplaythrough', function(e){

			// play for 100ms, to start buffering, and hide elements that should be hidden.
			App.popcorn.play()
			setTimeout(function(){
				App.popcorn.pause();
			}, 100);

			for(var i=0; i<data.elements.length; i++){
				var element = data.elements[i];
				var attr = {start: element.start,
							end: element.end,
							name: element.name,
							hoverCss: element.hoverCss,
							hoverText: element.hoverText,
							link: element.link,
							asin: element.asin,
							hover: element.hover,
							id: i+1,
							afx: element.afx,
							raphaelWidth: element.raphaelWidth,
							raphaelHeight: element.raphaelHeight,
							opacityAnimation: element.opacityAnimation,
							customHover: element.customHover,
							attr:element.attr}
				App.events[i] = new Event(attr, {collection:App.eventsCollection,
												preloaded: true,
												keyframes: element.keyframes,
												customHover: element.customHover,
												hoverObj: element.hoverObj});
			}



			
			
		});

		

		// (4) hide upload window, show video screen
		$('#header').animate({top: '-130px'}, 800);
		$('#error_container').fadeOut();
		$('#input_container').fadeOut(500, function(){
			$('#tool_container').fadeIn(500);
			$('#header .menu').fadeIn(500);
		});
	}