var Cart = Backbone.Model.extend({
	initialize: function(attr, options) {
		this.view = new CartView({model:this});
	},
	defaults: {
		Items:[],
		CartId: null,
		HMAC: null,
		Subtotal: 0
	},
	addItem: function(item){
		var self = this;
		var params = {
			'Item.1.ASIN': item.ASIN,
			'Item.1.Quantity': item.Quantity
		};
		if(this.get('CartId')){// add to cart
			params.Operation = 'CartAdd';
			params.CartId = this.get('CartId');
			params.HMAC = this.get('HMAC');
		}else{// new cart
			params.Operation = 'CartCreate';
		}

		// send amazon request
		$.ajax({type:'POST', dataType:'json', 
			data: {params: params},
			url:'/~mashabelyi/LookAlive/php/amazonRequest.php', 
			success:function(res){
				self.set({'Items': res.Items, 'CartId': res.CartId, 'HMAC':res.HMAC, 'Subtotal': res.Subtotal, 'PurchaseUrl': res.PurchaseUrl});
				self.view.tabContainer.style.display = 'block';
			}, 
			error:function(err){
				alert(err.responseText);
			}
		});
	},
	getContents: function(){
		App.popcorn.pause();
		var self = this;
		var params = {Operation: 'CartGet',
					CartId: this.get('CartId'),
					HMAC: this.get('HMAC')}

		$.ajax({type:'POST', dataType:'json', 
			data: {params: params},
			url:'/~mashabelyi/LookAlive/php/amazonRequest.php', 
			success:function(res){
				self.set({'Items': res.Items, 'CartId': res.CartId, 'HMAC':res.HMAC, 'Subtotal': res.Subtotal, 'PurchaseUrl': res.PurchaseUrl});
				
				// render the full container items
				
				var out = '';
				for(i in res.Items){
					var item = res.Items[i];
					out += "<div class='cart-row'>"+
								"<div class='col c1'><img src='"+item.img+"' class='cart-img'/>"+item.title+"</div>"+
								"<div class='col c2'>"+item.price+"</div>"+
								"<div class='col c3'>"+item.quantity+"</div>"+
							"</div>";
				}
				$('.cart-contents').html(out);
				// link button to amazon cart page
				$('.cart-checkout-btn').click(function(){
					var a = document.createElement('a');
					$(a).attr({href: res.PurchaseUrl, target:'_blank'});
					window.open($(a).attr('href'));
					$(a).remove();
				});

				$(self.view.fullContainer).fadeIn(300);
			}, 
			error:function(err){
				alert(err.responseText);
			}
		});

	}
});
var CartView = Backbone.View.extend({
	initialize: function(){		
		this.render();
		var self = this;
		this.model.on("change", function(){
			self.updateCart();
		});
	},
	render: function(){
		// tab view
		this.tabContainer = document.createElement('div');
		this.tabContainer.id = "amazon-cart";
		var parent = document.getElementById('videoWrapper');
		parent.appendChild(this.tabContainer);

		this.fullContainer = document.getElementById('amazon-cart-contents');
		parent.appendChild(this.fullContainer);

	},
	renderItem: function(){

	},
	updateCart: function(){
		this.tabContainer.innerHTML = this.model.get('Items').length;
	},
	showContents: function(){

	}
});