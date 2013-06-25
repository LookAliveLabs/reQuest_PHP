/*
	EVENT MODEL - a single interactive event. Properties: start time, end time, start(x,y), end(x,y), start(width, height), end(width, height)
		COLLECTION: EVENTS
*/
var Event = Backbone.Model.extend({
	initialize: function(attr, options) {
		_.bindAll(this, 'destroy');
		
		// add this model to events collection
		this.collection.push(this);

		this.preloaded = options.preloaded;
		this.keyframes = options.keyframes;
		this.customHover = options.customHover;
		this.hoverObj = options.hoverObj;
		
		if(!options.preloaded){
			// set start and end time to current time, set default keyframes
			this.set({start: Math.round(App.popcorn.currentTime()*1000)/1000,
					end: 5+Math.round(App.popcorn.currentTime()*1000)/1000});
			this.keyframes = {time:[this.get('start'), this.get('end')], x:[], y:[], w:[], h:[]};
			// this.keyframes = {time:[this.get('start'), this.get('end')], x:[0,0], y:[0,0], w:[10,10], h:[10,10]};
		}

		this.defaultCss = "width:100px;\nline-height: 18px;\npadding: 11px 15px;\nfont-size: 18px;\ntext-align: center;\ncolor: rgb(255, 205, 3);\nbackground: rgb(16, 185, 1);\nborder: 2px solid rgb(255, 205, 3);\nborder-radius: 5px;\ntext-shadow: rgb(0, 0, 0) 1px 1px 1px;\nbox-shadow: rgba(0, 0, 0, 0.4) 1px 1px 10px 0px;\nfont-family: 'Open Sans', sans-serif;";

		

		this.formView = new AddEventForm({collection:this.collection, model:this});
		App.currEvent = this;
		this.tabView.toggleView();
		
    },
    defaults: {
        start: 0,
        end: 5,
        name: '',
        hoverText: 'hover text',
        hoverCss: "width:100px;\nline-height: 18px;\npadding: 11px 15px;\nfont-size: 18px;\ntext-align: center;\ncolor: rgb(255, 205, 3);\nbackground: rgb(16, 185, 1);\nborder: 2px solid rgb(255, 205, 3);\nborder-radius: 5px;\ntext-shadow: rgb(0, 0, 0) 1px 1px 1px;\nbox-shadow: rgba(0, 0, 0, 0.4) 1px 1px 10px 0px;\nfont-family: 'Open Sans', sans-serif;",
        afx: false,
        hover:false
    },
    destroy: function(){
    	//destroy this model, remove from collection, destroy form view, destroy dummy div
    	this.collection.remove(this); // remove model from collection
    	this.formView.destroy(); // destroy formView
    }
});

/*
	EVENTS - a collection of all events for the video
		MODEL: EVENT
*/
var Events = Backbone.Collection.extend({
	model: Event,
    initialize: function() {

    }

});

/*
	EVENT TAB VIEW - single event tab
		MODEL: EVENT
*/
var EventTab = Backbone.View.extend({
	tagName: 'li',
	className: 'event_tab',
	events: {
		"click": "toggleView"
	},
	initialize: function(){
		_.bindAll(this, 'render', 'toggleView');
		this.model.tabView = this;
	},
	render: function(){
		$(this.el).html(this.model.get('id'));
		return this;
	},
	toggleView: function(){
		// render this models eventForm view
		this.model.formView.render();

		$(this.el).removeClass('error');

		var wasSelected = $(this.el).hasClass('current');
		// scroll all other tabs
		$('.event_tab').removeClass('current');
		//hide all event boxes
		// $('.dummy').css({'display':'none'});
		App.eventsCollection.each(function(event){
			$(event.formView.dummy).css({'display':'none'});
		});

		if(!wasSelected){
			App.currEvent = this.model;
			// open this event
			$(this.el).addClass('current');

			//highlight this square
			$(this.model.formView.dummy).css({'display':'block'});
		}
	}
});

/*
	TABS - view of all event tabs. Re-renders when events are added/removed from the Events collection
		COLLECTION: EVENTS
*/
var Tabs = Backbone.View.extend({
	el: '#tabs', //<ul id='tabs'></ul>
	initialize: function(){
		this.collection.bind('add', function(){
			this.render();

		}, this);
		this.collection.bind('remove', function(event){
			this.render();
			if(this.collection.length>0){
				this.collection.models[event.id>1 ? event.id-2 : 0].tabView.toggleView();
			}else{
				$('.add_event_form').remove();
			}
		}, this);
	},
	render: function(){
		// for each event in the collection - display a tab view
		$(this.el).html(''); // clear element
		var counter = 1;
		this.collection.each(function(event){
			event.set({id:counter});
			var tab = new EventTab({model:event});
			$(this.el).append(tab.render().el);
			counter +=1;
		},this);

		$(this.el).append('<li id="add_event" class="event_tab">+</li>');

		$('#add_event').click(function(){
			if(App.eventsCollection.length<6){
				App.events[App.numevents] = new Event({}, {collection:App.eventsCollection});
				if(App.eventsCollection.length == 6){
					$('#add_event').fadeOut();
				}
			}
		});
	}
});

/*
	ADD EVENT FORM - View consists of a form used to add an interactive event to the video
		MODEL: EVENT
*/
var AddEventForm = Backbone.View.extend({
	tagname: 'div',
	className: 'add_event_form', // el should be already in html doc
	// el: '.add_event_form',
	events:{
		"focus .starttime": "onStarttime",
		"keyup .starttime": "onStarttime",
		"focus .endtime": "onEndtime",
		"keyup .endtime": "onEndtime",
		"keyup .hover_text": "keyupHoverText",
		"keyup .hover_css": "keyupHoverCss",
		"keyup .elname": "keyupName",
		"keyup .link": "keyupLink",

		"focus input": "onTextFocus",
		"blur input": "onTextBlur",
		"focus textarea": "onTextFocus",
		"blur textarea": "onTextBlur",
		"click .event_delete": "deleteEvent",

		"change .hover": "toggle_hover",
		"click .record":"toggle_record"
	},
	initialize: function(options){
		 _.bindAll(this, 'render', 'toggleForm', 'onStarttime', 'onEndtime', 'deleteEvent', 'toggle_hover', 'toggle_record');
		var self = this;
		App.numEvents = options.eventId;

		// Setup variables
		this.eventId = options.eventId; // event Id unique differentiates this event from others and is the index of this event in the EVENTS array []

		this.setEndTime = false;
		// render on init
		this.render();

		// set 2 default keyframes
		if(!this.model.preloaded && ! this.model.get('afx')){
			this.currX = 0; this.currY = 0; this.currW = 10; this.currH = 10;
			this.setFirstKeyframe();
			this.setLastKeyframe();
		};

		// render the element shape
		this.renderElement();
		this.renderMouseover();
		

		// bind this model change events
		this.model.on('change', function() {
		  if (self.model.hasChanged('start')) {
		    self.$('.starttime').val(self.model.get('start'));
		    $('#startPoint').css('left', $('#defaultBar').width()*(self.model.get('start')/App.popcorn.duration())+'px');
		    if(!self.model.get('afx')) self.setFirstKeyframe();
		  }
		  if (self.model.hasChanged('end')){
		  	self.$('.endtime').val(self.model.get('end'));
		    $('#endPoint').css('left', $('#defaultBar').width()*(self.model.get('end')/App.popcorn.duration())+'px');
		    if(!self.model.get('afx')) self.setLastKeyframe();
		  }
		  if(self.model.hasChanged('name')){
		  	self.$('.elname').val(self.model.get('name'));
		  }
		  if (self.model.hasChanged('hover')) {
		  	self.toggle_hover();
		  }
		  if (self.model.hasChanged('invisible')) {
		  	self.toggle_invisible();
		  }
		  if (self.model.hasChanged('pause')) {
		  	self.model.hoverObj.pause = self.model.get('pause');
		  	self.toggle_pause();
		  }
		  if (self.model.hasChanged('hoverText')) {
		  	if(!self.mouseoverText){
		  		self.renderMouseover();
		  	}
		  	$('.hover_text').val(self.model.get('hoverText'));
		  	self.mouseoverText.attr({'text': self.model.get('hoverText')});
		  	if(self.mouseoverText.initAttrs){
		  		self.mouseoverText.initAttrs.text = self.model.get('hoverText');
		  	}
		  	if(self.mouseoverText.fullAttrs){
		  		self.mouseoverText.fullAttr.text = self.model.get('hoverText');
		  	}
		  }
		  if (self.model.hasChanged('hoverCss')) {
		  	$('.hover_css').html(self.model.get('hoverCss'));
		  }
		});

	},
	render: function(){
		$('.add_event_form').remove();

		App.popcorn.currentTime(this.model.get('start'));
		
		var self = this;
		// RENDER: render event form for this model
		
		dust.render("eventForm", this.model.attributes, function(err, out) {
            if(!err) {
                $(self.el).html(out);
            } else {
                return console.log(err);
            }
        });

		$('#events').html(this.el);
		this.delegateEvents();
		this.currentFocus = this.$('.starttime');

		///checkmarkSVG -
		var checkmarkSVG=["hover",30,30,{"fill":"#FF2D00","type":"path","stroke":"none","path":"M1.125,18.75l7.25-4.625l3.875,7.25c0,0,2.358-5.429,6-10 C24.125,4,28.875,1.75,28.875,1.75v10.875c0,0-5.848,3.854-7.25,5.25C19.173,20.317,12.75,28.5,12.75,28.5S3.75,19.833,1.125,18.75z "}];
		var checkmark = new Raphael(checkmarkSVG).transform("s0.9,0.9,0,0");
		this.hover_checkmark = $($('#hover').children()[0]);
		this.hover_checkmark.css({
			top:'-14px', left:'-4px', 'display':'none'}
			);
		var checkmarkSVG=["invisible_chkbox",30,30,{"fill":"#FF2D00","type":"path","stroke":"none","path":"M1.125,18.75l7.25-4.625l3.875,7.25c0,0,2.358-5.429,6-10 C24.125,4,28.875,1.75,28.875,1.75v10.875c0,0-5.848,3.854-7.25,5.25C19.173,20.317,12.75,28.5,12.75,28.5S3.75,19.833,1.125,18.75z "}];
		var checkmark = new Raphael(checkmarkSVG).transform("s0.9,0.9,0,0");
		this.invisible_checkmark = $($('#invisible_chkbox').children()[0]);
		this.invisible_checkmark.css({
			top:'-14px', left:'-4px', 'display':'none'}
			);
		var checkmarkSVG=["pause_chkbox",30,30,{"fill":"#FF2D00","type":"path","stroke":"none","path":"M1.125,18.75l7.25-4.625l3.875,7.25c0,0,2.358-5.429,6-10 C24.125,4,28.875,1.75,28.875,1.75v10.875c0,0-5.848,3.854-7.25,5.25C19.173,20.317,12.75,28.5,12.75,28.5S3.75,19.833,1.125,18.75z "}];
		var checkmark = new Raphael(checkmarkSVG).transform("s0.9,0.9,0,0");
		this.pause_checkmark = $($('#pause_chkbox').children()[0]);
		this.pause_checkmark.css({
			top:'-14px', left:'-4px', 'display':'none'}
			);

		$('#hover').click(function(){
			if(self.model.get('hover')){
				self.model.set({hover:false});
			}else{
				self.model.set({hover:true});
			}
		});

		$('#invisible_chkbox').click(function(){
			if(self.model.get('invisible')){
				self.model.set({invisible:false});
			}else{
				self.model.set({invisible:true});
			}
		});

		$('#pause_chkbox').click(function(){
			if(self.model.hoverObj.pause){
				self.model.hoverObj.pause = false;
				self.model.set({'pause':false});
			}else{
				self.model.hoverObj.pause = true;
				self.model.set({'pause':true});
			}
		});

		if(this.model.hoverObj && this.model.hoverObj.static){
			this.model.hoverObj.pause = true;
			this.toggle_pause();
		}

		this.toggle_hover();
		this.toggle_invisible();
		
		if(this.model.get('afx')){
			this.$('.starttime').attr({'readonly': true});
			this.$('.endtime').attr({'readonly': true});
		}

		// set currFocus to this starttime
		App.currFocus = this.$('.starttime');

		//highlight start fields
		this.$('input').removeClass('selected');
		this.$('.starttime').addClass('selected');

		//set startPont and endPoint positions
		if(!App.popcorn.duration()){
			App.popcorn.on('canplaythrough', function(e){
				$('#startPoint').css('left', 100*self.model.get('start')/App.popcorn.duration()+'%');
				$('#endPoint').css('left', 100*self.model.get('end')/App.popcorn.duration()+'%');
	    	});
		}else{
			$('#startPoint').css('left', 100*self.model.get('start')/App.popcorn.duration()+'%');
			$('#endPoint').css('left', 100*self.model.get('end')/App.popcorn.duration()+'%');
		}

		this.recording = true;

		// Load after effects data
		$('#afx_file').click(function(){
			this.value = null;
		}).bind('change', function(e){
			// dipslay file name to the right
			var fname = $('#afx_file').val().split('\\')[$('#afx_file').val().split('\\').length-1];
			$('#afx_file_text').html(fname);
			// load after effects data
			self.model.set({'afx':true});

			var file = e.target.files[0];
			console.log(file);
			var reader = new FileReader();

			// Capture file information
	         reader.onload = (function(theFile) {
	            return function(e) {
					// Read contents of the file
					var data = JSON.parse(e.target.result);

					App.frameDuration = parseFloat(data.frameDuration);

					self.model.keyframes = data.keyframes;
					self.model.customHover = data.customHover;
					self.model.hoverObj = data.hoverObj;
					self.model.set({afx: true,
									start: parseFloat(data.start),
									end: data.end,
									name: data.name.replace(/ /g, '_'),
									raphaelWidth: data.width,
									raphaelHeight: data.height,
									hover: data.hover,
									opacityAnimation: data.opacityAnimation,
									customHover: data.customHover,
									hoverText: data.hoverObj ? (data.hoverObj.text ? data.hoverObj.text.text.replace(/%n%/g, '\n') : 'hover text') : 'hover text',
									hoverCss: data.hoverObj ? '[imported from after effects]' : self.model.defaultCss,
									attr: data.attr,
									invisible: data.invisible,
									pause: data.hoverObj.static
								});
					
			 		//jump player to inPoint position
			 		App.popcorn.currentTime(data.start);

			 		// render the element shape
					self.renderElement();
					self.renderMouseover();
					
	            };
	         })(file);

	         reader.readAsText(file);
		});
	},
	renderMouseover: function(){
		var self = this;
		if(this.mouseover){this.mouseover.remove();}
		if(this.mouseoverText){this.mouseoverText.remove();}
		// create mouseover element, if needed
		if(this.model.get('hover')){
			if(this.model.get('afx') && this.model.customHover){ // this is a raphael element with a custom hover element
				// Draw mouseover Raphael element(s)!!!!!! :D
				var hoverObj = this.model.hoverObj;
				this.mouseoverScaleStr = "S"+App.player.width/this.model.get('raphaelWidth')+", "+App.player.height/this.model.get('raphaelHeight')+", 0, 0"; // scale to fit player

				// (h1) Create raphael set of hover elements - reverse order to mimic order in After effects
				this.mouseover = App.paper.set();
				for (var e=hoverObj.el.length-1; e>=0; e--){
					var el = hoverObj.el[e]; // info for this el
					// pull out the initial keyframes for each attribute
					var attr = {};
					var varyingAttrs = []; // will contain an array of all varying attributes
					for (key in el){
						if(typeof el[key] == 'object'){
							attr[key] = el[key][0].val;
							varyingAttrs.push(key);
							this.mouseover.animated = true;
						}else{
							attr[key] = el[key];
						}
					}
					var raphaelEl = App.paper.add([attr]).attr(attr); // force attr again, to set correct center for rectangles
					raphaelEl = raphaelEl[0];
					this.mouseover.push(raphaelEl);


					// (h2) define transforms and variables for each - will be used when animating hover layers. use LAST keyframes for this
					raphaelEl.myStrokeWidth = (typeof el['stroke-width'] =='object') ? el['stroke-width'][ el['stroke-width'].length-1].val : el['stroke-width'];
					raphaelEl.myTransform = (typeof el['transform'] =='object') ? el['transform'][ el['transform'].length-1].val : el['transform'];
					$(raphaelEl.node).css({'display':'none',
									'pointer-events': 'none'});
					// array of attrs
					raphaelEl.myVaryingAttrs = varyingAttrs;
					raphaelEl.fullAttr = hoverObj.el[e];
					raphaelEl.initAttrs = attr;

				}
				
				// (h3) Add the text element, if necessary - separately so that it can be linked to the hover text box in the tool
				if(hoverObj.text){
					
					// download google font, if not already downloaded
					var fontname = (hoverObj.text['font-family']).replace(/ /g, '+') + ':' + hoverObj.text['font-weight'] + hoverObj.text['font-style'];
					if(!App.fonts[fontname]){
						var wf = document.createElement('link');
				        wf.href = ('https:' == document.location.protocol ? 'https' : 'http') +
				            '://fonts.googleapis.com/css?family=' + fontname;
				        wf.type = 'rel/stylesheet';
				        wf.async = 'true';
				        var s = document.getElementsByTagName('link')[0];
				        s.parentNode.insertBefore(wf, s);

				        App.fonts[fontname] = true;
				    }

				    var attr = {};
					var varyingAttrs = []; // will contain an array of all varying attributes
					for (key in hoverObj.text){
						if(typeof hoverObj.text[key] == 'object'){
							attr[key] = hoverObj.text[key][0].val;
							varyingAttrs.push(key);
							this.mouseover.animated = true;
						}else{
							attr[key] = hoverObj.text[key];
						}
					}

					// insert \n for linebreaks in text
					attr['text'] = hoverObj.text.text.replace(/%n%/g, '\n');

					this.mouseoverText = (App.paper.text({x:0,y:0}).attr(attr));
					$(this.mouseoverText.node).css({'display':'none',
													'pointer-events': 'none'});
					this.mouseover.push(this.mouseoverText);

					this.mouseoverText.myVaryingAttrs = varyingAttrs;
					this.mouseoverText.fullAttr = hoverObj.text;
					this.mouseoverText.initAttrs = attr;
					this.mouseoverText.myTransform = (typeof hoverObj.text.transform == 'object') ? hoverObj.text.transform[hoverObj.text.transform.length-1].val : hoverObj.text.transform;

					// set font style and weight
					// $('tspan', this.mouseoverText.node).css({'font-weight': hoverObj.text['font-weight'], 'font-style': hoverObj.text['font-style']});
					$('tspan', this.mouseoverText.node).attr('dy', attr['font-size']*1.12); // line height = 112% of text height
					$($('tspan', this.mouseoverText.node)[0]).attr('dy', 0);

				}
				// (h4) transform the layer, then scale to fit screen
				// this.mouseover.transform("..."+(hoverObj.static ? hoverObj.transform : ''));// scale+translate the entire hover layer
				this.mouseover.transform("..."+this.mouseoverScaleStr); // scale to fit player

				// (h5) reset stroke widths - there is a bug in Raphael that scales stroke width in the opposite direction. If scale by 1/3, stroke scales by 3 :(
				this.mouseover.forEach(function(e){
					if(e.type!='text'){
						e.attr({'stroke-width':e.myStrokeWidth*App.player.width/self.model.get('raphaelWidth')});
					}
				});
			}else{
				this.mouseover = document.createElement('div');
				this.mouseover.className = 'mouseover';
				$(this.mouseover).css({'cursor':'pointer',
									'display':'none',
									'pointer-events': 'none'});
				$('#video_container').append(this.mouseover);
			}

			this.toggle_hover();
			if(this.model.hoverObj.static){
				this.model.hoverObj.pause = true;
			}else{
				this.model.hoverObj.pause = false;
			}
			this.toggle_pause();
			
			
		}
	},
	animateHover: function(param, el, obj, idx, addTransform, callback){
		var self = this;
		if(idx<obj[param].length){
			var newattr = {};
			newattr[param] = obj[param][idx].val;
			// if transform - add scaling transform
			if(param == 'transform'){
				newattr[param] += this.mouseoverScaleStr + addTransform;
				newattr['stroke-width'] = el.myStrokeWidth*App.player.width/self.model.get('raphaelWidth');
			}
			el.animate(newattr, obj[param][idx].t - obj[param][idx-1].t, function(){
				self.animateHover(param, el, obj,idx+1, addTransform, callback);
			});
		}else{
			callback(null);
		}
	},

	renderElement: function(){
		var self = this;
		this.toggle_invisible;
		// clear elements
		if(this.dummy){this.dummy.remove();}
		if(this.raphael){this.raphael.node.remove();}

		if(this.model.get('afx')){ // render raphael element
    		var startFrame = Math.floor(this.model.get('start')/App.frameDuration);
    		if(this.model.get('attr')){
    			// text layer!
    			this.raphael = App.paper.add([this.model.get('attr')]).transform("s"+App.player.width/this.model.get('raphaelWidth')+", "+App.player.height/this.model.get('raphaelHeight')+", 0, 0");
    			this.raphael.id = this.model.get('id');
    			this.dummy = this.raphael[0].node;
    		}else{
		 		init = this.model.keyframes[startFrame];
				var myPath = 'M'+ init.x[0] +','+ init.y[0];
				for(var i=1; i<init.x.length; i++){
					myPath += 'C'+init.outTanX[i-1]+' '+init.outTanY[i-1]+' '+init.inTanX[i]+' '+init.inTanY[i]+' '+ init.x[i] + ' ' + init.y[i];
				}
				myPath+= 'C'+init.outTanX[i-1]+' '+init.outTanY[i-1]+' '+init.inTanX[0]+' '+init.inTanY[0]+' '+ init.x[0] + ' ' + init.y[0];
				this.raphael = App.paper.path(myPath).transform("s"+App.player.width/this.model.get('raphaelWidth')+", "+App.player.height/this.model.get('raphaelHeight')+", 0, 0");
				this.raphael.attr({
					'stroke': '#11b900',
					'stroke-dasharray': '--',
					'stroke-width': (this.model.get('opacityAnimation') || parseFloat(init.opacity)) ? 0:4,
					'fill': init.fill,
					'fill-opacity': parseFloat(init.opacity)
				});
				this.raphael.id = this.model.get('id');

				this.dummy = this.raphael.node;
				// this.dummy.style.display = 'none';
				this.dummy.onmouseover = function() {
	    			this.style.cursor = 'pointer';
				}
				this.$('.starttime').attr({'readonly': true});
				this.$('.endtime').attr({'readonly': true});
				// onClick event if LINK??? ***

				$(this.raphael.node).mouseenter(function(evt){
					evt.preventDefault(); evt.stopPropagation();
					if(self.model.get('hover') && self.model.get('customHover')){
						$(self.raphael.node).css('cursor', 'pointer');

						if(self.model.hoverObj.pause){
							if(!App.player.paused){App.popcorn.pause();}
						}

						if(!self.model.hoverObj.static){
							var xOffset = evt.offsetX - self.model.hoverObj.anchor.x * App.player.width/self.model.get('raphaelWidth');
							var yOffset = evt.offsetY - self.model.hoverObj.anchor.y * App.player.height/self.model.get('raphaelHeight');

							self.mouseover.forEach(function(e){
								e.attr(e.initAttrs);
								e.attr({'transform': "..."+self.mouseoverScaleStr+"T"+xOffset+","+yOffset, 'stroke-width':e.myStrokeWidth*App.player.width/self.model.get('raphaelWidth')});
								if(e.initAttrs.type=='text'){
									$($('tspan', e.node)[0]).attr('dy', 0);
								}
							});
						}else if(self.model.hoverObj.static ){
							if(!App.player.paused && self.model.hoverObj.pause){App.popcorn.pause();}
							// reset all elements to original parameters
							self.mouseover.forEach(function(e){
								e.attr(e.initAttrs);
								e.attr({'transform': "..."+self.mouseoverScaleStr, 'stroke-width':e.myStrokeWidth*App.player.width/self.model.get('raphaelWidth')});
								if(e.initAttrs.type=='text'){
									$($('tspan', e.node)[0]).attr('dy', 0);
								}
							});
						}

						// if hover does not have animated keyframes - default to a simple fadeIN
						if(!self.mouseover.animated){
							self.mouseover.forEach(function(e){
							    $(e.node).stop().css({'opacity':1}).fadeIn(300); // opacity = 1, so that the element laways fades in. Otherwise the fadeOu interferes
							});
						}else{
							// Else - animate keyframes!!!
							self.mouseover.animating = true;
							self.mouseover.forEach(function(e){
								async.map(e.myVaryingAttrs, function(attr, callback){
									$(e.node).stop().css({'display':'block', 'opacity':1});
									var addTransform = self.model.hoverObj.static ? ' ' : "T"+xOffset+","+yOffset;
									self.animateHover(attr, e, e.fullAttr, 1, addTransform, callback);
								}, function(err){
									self.mouseover.animating = false;
								});
							});
						}
						
						
					}else if(self.model.get('hover') && !self.model.get('customHover')){ //regular hover
						//set html and css
						self.mouseover.innerHTML = $('.hover_text').val();
						self.mouseover.style.cssText= $('.hover_css').val();
						//show
						$(self.mouseover).stop().fadeIn(300).offset({left:evt.pageX+20, top:evt.pageY-20});
					}
				}).mousemove(function(evt){
					evt.preventDefault(); evt.stopPropagation();
					if(self.model.get('hover') && self.model.get('customHover')){
						if(!self.model.hoverObj.static && !self.mouseover.animating){
							// calculate offset
							var xOffset = evt.offsetX - self.model.hoverObj.anchor.x * App.player.width/self.model.get('raphaelWidth');
							var yOffset = evt.offsetY - self.model.hoverObj.anchor.y * App.player.height/self.model.get('raphaelHeight');
							self.mouseover.forEach(function(e){
							    e.attr({'transform':  e.myTransform +self.mouseoverScaleStr + "T"+xOffset+","+yOffset, 'stroke-width':e.myStrokeWidth*App.player.width/self.model.get('raphaelWidth')});
							});
						}
					}else if(self.model.get('hover') && !self.model.get('customHover')){ // regular hover
						$(self.mouseover).offset({left:evt.pageX+20, top:evt.pageY-20});
					}
				}).mouseleave(function(evt){
					evt.preventDefault(); evt.stopPropagation();
					// self.mouseover.animating = false;
					if(self.model.get('hover') && self.model.get('customHover')){
						if(self.model.hoverObj.static || self.model.hoverObj.pause){
							if(!App.player.paused){App.popcorn.play();}	
						}

						self.mouseover.forEach(function(e){
							e.stop();
						    $(e.node).stop().fadeOut(300);
						});
						
					}else if(self.model.get('hover') && !self.model.get('customHover')){
						$(self.mouseover).stop().fadeOut(300);
					}
				});
			}
    	}else{
			// add a 'dummy' block to the video
			this.dummy = document.createElement('div');
			this.dummy.className = 'dummy';
			$('#video_container').append(this.dummy);
			// make div draggable and resizable.
			var self = this;
			$(this.dummy).resizable({
				handles: "ne, nw, se, sw, n, s, e, w",
				maxHeight: App.video.height,
				maxWidth: App.video.width,
				resize: function( event, ui ) {
					self.currW = Math.round(100*ui.size.width/App.video.width);
					self.currH = Math.round(100*ui.size.height/App.video.height);
				},
				stop: function(event,ui){
					// record keyframes
					if(self.recording){
						App.saved = false;
						var t = roundTime(App.popcorn.currentTime());
						var keyframes = self.model.keyframes;
						if(keyframes.time.indexOf(t) == -1){
							var idx = insert(t, keyframes.time);
							var del = 0;
						}else{
							var idx = keyframes.time.indexOf(t);
							var del = 1;
						}
						keyframes.w.splice(idx, del, self.currW);
						keyframes.h.splice(idx, del, self.currH);
						keyframes.x.splice(idx, del, self.currX);
						keyframes.y.splice(idx, del, self.currY);
					}
				}
			}).draggable({ containment: "parent",
				drag: function(event, ui){
					self.currX = Math.round(100*ui.position.left/App.video.width);
					self.currY = Math.round(100*ui.position.top/App.video.height);
				},
				stop: function(event, ui){
					if(self.recording){
						App.saved = false;
						var t = roundTime(App.popcorn.currentTime());
						var keyframes = self.model.keyframes;
						if(keyframes.time.indexOf(t) == -1){
							var idx = insert(t, keyframes.time);
							var del = 0;
						}else{
							var idx = keyframes.time.indexOf(t);
							var del = 1;
						}
						keyframes.x.splice(idx, del, self.currX);
						keyframes.y.splice(idx, del, self.currY);
						keyframes.w.splice(idx, del, self.currW);
						keyframes.h.splice(idx, del, self.currH);
					}

				}
			}).mouseenter(function(evt){
				if(self.model.get('hover')){
					//set html and css
					self.mouseover.innerHTML = $('.hover_text').val();
					self.mouseover.style.cssText= $('.hover_css').val();
					//show
					$(self.mouseover).stop().fadeIn(300).offset({left:evt.pageX+20, top:evt.pageY-20});

				}
			}).mousemove(function(evt){
				if(self.model.get('hover')){
					$(self.mouseover).offset({left:evt.pageX+20, top:evt.pageY-20});
				}
			}).mouseleave(function(evt){
				$(self.mouseover).stop().fadeOut(300);
			});
		}
	},
	toggleForm: function(){
		var wasClosed = $(this.el).hasClass('tab');
		// scroll all other events
		$('.add_event_form').addClass('tab');
		$('.dummy').addClass('gray');
		if(wasClosed){
			// open this event
			$(this.el).removeClass('tab');
			// set currFocus to this starttime
			App.currFocus = this.$('.starttime');
			//highlight this square
			$(this.dummy).removeClass('gray');

			// seek to the startpoint of this video
			App.popcorn.currentTime(this.$('.starttime').val());
		}
	},
	onStarttime: function(e){
		e.preventDefault(); e.stopPropagation;
		var val = this.$('.starttime').val();
		App.popcorn.currentTime(val);
		App.currFocus = this.$('.starttime');
		App.currEvent = this.model;

		if(!this.model.get('afx')){
			this.model.set({'start': parseFloat(val)});
			var keyframes = this.model.keyframes;
			if(val.length>0 && val[val.length-1]!='.'){
				App.popcorn.currentTime(val);

				// set box position to first keyframe
				$(this.dummy).css({width: this.model.keyframes.w[0]+'%',
								height: this.model.keyframes.h[0]+'%',
								top: this.model.keyframes.y[0]+'%',
								left:this.model.keyframes.x[0]+'%'});
				
				// advance startPoint position
				$('#startPoint').css('left', $('#defaultBar').width()*(val/App.player.video.duration)+'px');

			}
		}

		//highlight start fields
		this.$('input').removeClass('selected');
		this.$('.starttime').addClass('selected');
		this.$('.startPosition').addClass('selected');
		this.$('.startSize').addClass('selected');
	},
	onEndtime: function(e){
		this.setEndTime = true;
		e.preventDefault(); e.stopPropagation;
		var val = this.$('.endtime').val();
		App.popcorn.currentTime(val);
		App.currFocus = this.$('.endtime');
		App.currEvent = this.model;

		if(!this.model.get('afx')){
			this.model.set({'end': parseFloat(val)});
			var keyframes = this.model.keyframes;
			var l = keyframes.time.length-1;
			if(val.length>0 && val[val.length-1]!='.'){
				App.popcorn.currentTime(val);
				// set box position to last keyframe
				$(this.dummy).css({width: this.model.keyframes.w[l]+'%',
								height: this.model.keyframes.h[l]+'%',
								top: this.model.keyframes.y[l]+'%',
								left:this.model.keyframes.x[l]+'%'});

				// advance endPoint position
				$('#endPoint').css('left', $('#defaultBar').width()*(val/App.player.video.duration)+'px')
			}
		}

		//highlight end fields
		this.$('input').removeClass('selected');
		this.$('.endtime').addClass('selected');
		this.$('.endPosition').addClass('selected');
		this.$('.endSize').addClass('selected');
	},
	deleteEvent: function(e){
		e.preventDefault(); e.stopPropagation();
		// $(this.el).remove();
		// $(this.dummy).remove();
		this.model.destroy();
		if(App.eventsCollection.length < 6){
			$('#add_event').fadeIn();
		}

	},
	toggle_hover: function(){
		App.saved = false;
		if(this.model.get('hover')){
			this.hover_checkmark.fadeIn(100);
			if(!this.model.customHover){
				$('.hover_text').css('color', '#000').attr({readonly:false});
				$('.hover_css').css('color', '#000').attr({readonly:false});
			}else if(this.model.hoverObj.text){
				$('.hover_text').css('color', '#000').attr({readonly:false});
			}
			if(!this.mouseover){
				this.renderMouseover();
			}
		}else{
			this.hover_checkmark.fadeOut(100);
			if(!this.model.customHover){
				$('.hover_text').css('color', 'rgb(180, 180, 180)').attr({readonly:true});
				$('.hover_css').css('color', 'rgb(180, 180, 180)').attr({readonly:true});
			}else if(this.model.hoverObj.text){
				$('.hover_text').css('color', 'rgb(180, 180, 180)').attr({readonly:true});
			}
		}
	},
	toggle_invisible: function(){
		App.saved = false;
		if(this.model.get('invisible')){
			this.invisible_checkmark.fadeIn(100);
		}else{
			this.invisible_checkmark.fadeOut(100);
		}
	},
	toggle_pause: function(){
		App.saved = false;
		if(this.model.hoverObj.pause){
			this.pause_checkmark.fadeIn(100);
		}else{
			this.pause_checkmark.fadeOut(100);
		}
	},
	keyupHoverText: function(evt){
		if(this.model.get('hover') && this.model.customHover){
			this.mouseoverText.attr({text: $('.hover_text').val()});
			this.model.hoverObj.text.text = $('.hover_text').val().replace(/%\n%/g, '%n%');
			this.model.set({'hoverText': $('.hover_text').val()});
		}else{
			this.model.set({'hoverText': $('.hover_text').val()});
		}
	},
	keyupHoverCss: function(evt){
		if(this.model.get('hover') && this.model.customHover){
		}else{
			this.model.set({'hoverCss': $('.hover_css').val()});
		}
	},
	keyupName: function(evt){
		this.model.set({'name': $('.elname').val()});
	},
	keyupLink: function(evt){
		this.model.set({'link': $('.link').val()});
	},
	toggle_record: function(){
		if(!this.recording){this.recording = true;
			$('.record').html('Stop');
			//record first point
			var t = (Math.round(App.popcorn.currentTime()*100))/100;
			var keyframes = this.model.keyframes;
			if(keyframes.time.indexOf(t) == -1){
				var idx = insert(t, keyframes.time);
				var del = 0;
			}else{
				var idx = keyframes.time.indexOf(t);
				var del = 1;
			}
			keyframes.x.splice(idx, del, this.currX);
			keyframes.y.splice(idx, del, this.currY);
			keyframes.w.splice(idx, del, this.currW);
			keyframes.h.splice(idx, del, this.currH);

		}else{
			//record last point
			var t = (Math.round(App.popcorn.currentTime()*100))/100;
			var keyframes = this.model.keyframes;
			if(keyframes.time.indexOf(t) == -1){
				var idx = insert(t, keyframes.time);
				var del = 0;
			}else{
				var idx = keyframes.time.indexOf(t);
				var del = 1;
			}
			keyframes.x.splice(idx, del, this.currX);
			keyframes.y.splice(idx, del, this.currY);
			keyframes.w.splice(idx, del, this.currW);
			keyframes.h.splice(idx, del, this.currH);

			this.recording = false;
			$('.record').html('Start');
			console.log(JSON.stringify(this.model.keyframes));
		}
	},
	setFirstKeyframe: function(){
		// set curr position & size as the first keyframe at time = position of startPoint
		var keyframes = this.model.keyframes;
		var l = keyframes.time.length-1;
		var lx = keyframes.x.length;
		if(l==0){
			keyframes.x[0] = this.currX;
			keyframes.y[0] = this.currY;
			keyframes.w[0] = this.currW;
			keyframes.h[0] = this.currH;
			keyframes.time[0] = this.model.get('start');
		}else{
			keyframes.time[0] = this.model.get('start');
			keyframes.x[0] = this.currX;
			keyframes.y[0] = this.currY;
			keyframes.w[0] = this.currW;
			keyframes.h[0] = this.currH;
		}
	},
	setLastKeyframe: function(){
		// set curr position & size as the first keyframe at time = position of startPoint
		var keyframes = this.model.keyframes;
		var l = keyframes.time.length-1;
		var lx = keyframes.x.length;
		if(l==0){
			l=1; // if keyframes length = 1, add an end keyframe
			keyframes.x[l] = this.currX;
			keyframes.y[l] = this.currY;
			keyframes.w[l] = this.currW;
			keyframes.h[l] = this.currH;
			keyframes.time[l] = this.model.get('end');
		}else if(lx==0){
			// there are no keyframes yet, add 2 keyframes (set start == end)
			keyframes.x[0] = this.currX;
			keyframes.y[0] = this.currY;
			keyframes.w[0] = this.currW;
			keyframes.h[0] = this.currH;
			keyframes.time[0] = this.model.get('end');

			keyframes.x[1] = this.currX;
			keyframes.y[1] = this.currY;
			keyframes.w[1] = this.currW;
			keyframes.h[1] = this.currH;
			keyframes.time[1] = this.model.get('end');
		}else{
			//just change time of the last keyframe
			keyframes.time[l] = this.model.get('end');
		}
	},
	onTextFocus: function(e){
		App.onTextInput = true;
		if(e.target.className=='link'){
			if (this.$('input.link').val().length<1){
				this.$('input.link').val("http://");
			}
		}
		$(e.target).removeClass('empty');
		$(this.model.tabView.el).removeClass('error');
	},
	onTextBlur: function(e){
		App.saved = false;
		App.onTextInput = false;
		var self = this;
		if(e.target.className=='link'){
			if (this.$('input.link').val()=='http://'){
				this.$('input.link').val('');
			}
		}else if(e.target.className=='asin'){
			if (this.$('input.asin').val()!=''){
				var data = {params:{Operation:"ItemLookup", ItemId:this.$('input.asin').val(), IdType:"ASIN", Condition:"All"}};
				$.ajax({type:'POST', dataType:'json', 
					data: data, url:'php/amazonRequest.php', 
					success:function(res){
						self.model.set({'asin': $('.asin').val()});
					}, 
					error:function(err){
						alert(err.responseText);
					} });
			}
		}
	},
	destroy: function(){
		// delete the dummy box
		if(this.dummy){this.dummy.remove();}
		if(this.raphael){this.raphael.remove();}
		if(this.mouseover){this.mouseover.remove();}
		if(this.mouseoverText){this.mouseoverText.remove();}
		this.unbind();
	}
});