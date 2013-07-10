
var Item = Backbone.Model.extend({
	idAttribute: "CartItemId",
	initialize: function(){
		this.view = new ItemView({model:this});
		this.cid = this.get('CartItemId');
	},
	changeQuantity: function(item){
		var self = this;
		var params = {Operation: 'CartModify',
					CartId: this.collection.CartId,
					HMAC: this.collection.HMAC,
					'Item.1.CartItemId': item.CartItemId,
					'Item.1.Quantity': item.Quantity}

		$.ajax({type:'POST', dataType:'json', 
			data: {params: params},
			url: CONF['api_host']+'/php/amazonRequest.php', 
			success:function(res){
				self.set({quantity: item.Quantity});
				self.collection.countItems(res);

				if(item.Quantity == 0){
					self.destroy();
				}
				// self.collection.set(res.Items);
			}, 
			error:function(err){
				alert(err.responseText);
			}
		});
	},
	destroy: function(){
		this.collection.remove(this);
		this.view.destroy();
	}

})

var Cart = Backbone.Collection.extend({
	model: Item,
	initialize: function(attr, options) {
		this.renderViews();

		this.CartId = null;
		this.HMAC = null;
		this.Subtotal = 0;
		this.numItems = 0;

		// this.on("add", this.addModel());
	},
	renderViews: function(){
		// tab view
		this.tabContainer = document.createElement('div');
		this.tabContainer.id = "amazon-cart-tab";
		var parent = document.getElementById('videoWrapper');
		parent.appendChild(this.tabContainer);

		///shopping cart
		var shoppingCartSVG=["amazon-cart-tab",50,50,{"stroke":"none","path":"M2,16.54 9.333,16.54 17.231,32.899 36.693,32.899 45.154,18.232 40.078,18.232 34.719,28.949 \r\n\t\t20.051,28.949 11.872,12.026 2,12.026 \tz","fill":"#000","type":"path"},{"stroke":"none","fill":"#000","type":"circle","cx":19.487,"cy":38.259,"r":2.82},{"stroke":"none","fill":"#000","type":"circle","cx":35.282,"cy":37.976,"r":2.539}];
		RaphaelToScale(shoppingCartSVG);

		this.itemCounter = document.createElement('div');
		this.itemCounter.className = 'cart-itemCounter';
		this.tabContainer.appendChild(this.itemCounter);

		this.fullContainer = document.getElementById('amazon-cart-contents');
		parent.appendChild(this.fullContainer);

		///reQuested
		var requestedSVG=["requested",100,30,{"stroke":"none","path":"M3.163,9.123h1.295v2.116L5.02,10.72C6.2,9.598,7.495,9.036,8.905,9.036c1.123,0,2.087,0.289,2.893,0.864l-0.691,1.123 c-0.719-0.46-1.453-0.691-2.202-0.691c-1.18,0-2.18,0.396-3,1.188c-0.82,0.792-1.303,1.764-1.447,2.915v6.174H3.163V9.123z","fill":"#000","type":"path"},{"stroke":"none","path":"M22.031,19.054c-1.267,1.267-2.777,1.899-4.533,1.899c-1.699,0-3.16-0.568-4.383-1.705 c-1.224-1.137-1.835-2.584-1.835-4.34c0-1.698,0.547-3.13,1.642-4.296c1.093-1.166,2.46-1.749,4.102-1.749 c1.698,0,3.043,0.533,4.037,1.598c0.993,1.065,1.489,2.547,1.489,4.447v0.346h-9.974l0.043,0.389 c0.201,1.181,0.763,2.145,1.684,2.893c0.92,0.749,1.986,1.123,3.195,1.123c1.497,0,2.705-0.504,3.626-1.512L22.031,19.054z M20.995,13.656c-0.057-0.949-0.468-1.77-1.23-2.461c-0.764-0.69-1.678-1.036-2.742-1.036c-1.065,0-1.979,0.317-2.742,0.95 c-0.763,0.633-1.274,1.454-1.533,2.461l-0.086,0.389h8.376L20.995,13.656z","fill":"#000","type":"path"},{"stroke":"none","path":"M56.64,12.001c0,0.167-0.02,0.397-0.057,0.686c-0.036,0.29-0.085,0.607-0.146,0.953c-0.059,0.346-0.123,0.703-0.19,1.07 c-0.068,0.368-0.133,0.71-0.191,1.028c-0.06,0.317-0.107,0.597-0.145,0.836c-0.038,0.24-0.058,0.406-0.058,0.5 c0,0.174,0.004,0.334,0.011,0.48c0.006,0.146,0.025,0.275,0.056,0.384c0.031,0.108,0.08,0.192,0.145,0.252 c0.066,0.06,0.161,0.089,0.285,0.089c0.138,0,0.304-0.034,0.5-0.104c0.196-0.068,0.405-0.159,0.626-0.274 c0.222-0.116,0.447-0.245,0.677-0.394c0.231-0.145,0.45-0.301,0.659-0.462c0.209-0.162,0.399-0.322,0.571-0.481 c0.17-0.158,0.309-0.306,0.414-0.443c0,0.205,0.002,0.393,0.006,0.561c0.003,0.168,0.005,0.328,0.005,0.481 s0.001,0.31,0.005,0.472c0.001,0.162,0.004,0.344,0.004,0.541c-0.138,0.139-0.308,0.283-0.509,0.439 c-0.203,0.156-0.428,0.312-0.673,0.468c-0.247,0.155-0.509,0.306-0.786,0.448c-0.276,0.144-0.555,0.27-0.835,0.379 c-0.281,0.109-0.558,0.195-0.832,0.261c-0.273,0.065-0.529,0.099-0.767,0.099c-0.236,0-0.438-0.047-0.606-0.141 c-0.169-0.092-0.312-0.225-0.435-0.393c-0.121-0.167-0.225-0.368-0.309-0.603c-0.084-0.233-0.157-0.493-0.22-0.78 c-0.225,0.294-0.461,0.562-0.71,0.809s-0.503,0.459-0.762,0.641c-0.259,0.18-0.521,0.321-0.785,0.425 c-0.264,0.103-0.521,0.154-0.77,0.154c-0.207,0-0.399-0.034-0.58-0.103c-0.182-0.068-0.341-0.185-0.482-0.346 c-0.14-0.162-0.251-0.375-0.331-0.64c-0.082-0.265-0.122-0.595-0.122-0.986c0-0.48,0.058-1.091,0.173-1.833 c0.114-0.74,0.257-1.588,0.425-2.54c0.012-0.093,0.036-0.22,0.07-0.378s0.081-0.332,0.141-0.519 c0.06-0.186,0.133-0.376,0.219-0.569c0.088-0.193,0.189-0.368,0.309-0.523c0.118-0.155,0.257-0.284,0.416-0.383 c0.16-0.1,0.339-0.153,0.536-0.159c0.331,0.013,0.568,0.055,0.711,0.126c0.144,0.072,0.216,0.161,0.216,0.267 c-0.057,0.33-0.117,0.697-0.183,1.102c-0.065,0.406-0.132,0.813-0.2,1.224c-0.069,0.412-0.135,0.812-0.197,1.201 c-0.063,0.39-0.119,0.736-0.168,1.041c-0.051,0.307-0.089,0.553-0.117,0.739c-0.027,0.187-0.042,0.283-0.042,0.289 c0,0.112,0.011,0.22,0.032,0.321c0.022,0.104,0.056,0.195,0.099,0.277c0.043,0.08,0.1,0.146,0.168,0.195 c0.069,0.05,0.15,0.076,0.243,0.076c0.137,0,0.276-0.036,0.421-0.108c0.143-0.071,0.278-0.175,0.406-0.308 c0.128-0.135,0.241-0.299,0.342-0.496c0.099-0.195,0.174-0.419,0.224-0.668l0.925-4.747c0.03-0.149,0.157-0.275,0.378-0.379 c0.222-0.103,0.473-0.154,0.753-0.154c0.317,0,0.57,0.056,0.757,0.168C56.547,11.683,56.64,11.826,56.64,12.001z","fill":"#000","type":"path"},{"stroke":"none","path":"M61.797,20.363c-0.585,0-1.098-0.106-1.536-0.318c-0.439-0.211-0.806-0.496-1.099-0.854s-0.513-0.772-0.659-1.243 c-0.146-0.47-0.219-0.963-0.219-1.48c0-0.349,0.034-0.718,0.103-1.107c0.069-0.39,0.173-0.771,0.313-1.145 c0.141-0.374,0.315-0.73,0.527-1.07c0.211-0.339,0.46-0.638,0.743-0.896s0.601-0.464,0.953-0.617 c0.353-0.153,0.742-0.229,1.173-0.229c0.348,0,0.673,0.056,0.972,0.168c0.299,0.112,0.56,0.269,0.78,0.473 c0.221,0.202,0.394,0.446,0.518,0.732c0.126,0.287,0.188,0.607,0.188,0.963c0,0.386-0.095,0.771-0.286,1.157 c-0.188,0.387-0.452,0.75-0.789,1.094c-0.335,0.343-0.736,0.648-1.2,0.916c-0.465,0.268-0.968,0.477-1.509,0.626 c0.094,0.168,0.186,0.309,0.275,0.42c0.09,0.112,0.182,0.2,0.276,0.262c0.093,0.062,0.191,0.106,0.294,0.131 c0.103,0.025,0.213,0.038,0.332,0.038c0.373,0,0.768-0.075,1.182-0.225s0.817-0.336,1.211-0.561 c0.392-0.225,0.812-0.427,1.161-0.691c0.349-0.265,0.657-0.512,0.9-0.75l1.121,1.186c-0.549,0.566-1.109,1.09-1.726,1.525 c-0.27,0.188-0.556,0.371-0.865,0.551C64.624,19.6,64.3,19.761,63.96,19.9c-0.34,0.141-0.69,0.253-1.056,0.336 C62.54,20.321,62.171,20.363,61.797,20.363z M60.555,15.972c0.224,0,0.469-0.058,0.732-0.173c0.266-0.116,0.512-0.264,0.738-0.443 c0.228-0.182,0.419-0.378,0.574-0.59c0.156-0.211,0.234-0.416,0.234-0.616c0-0.28-0.052-0.51-0.153-0.692 c-0.104-0.18-0.229-0.27-0.379-0.27c-0.269,0-0.496,0.05-0.687,0.149c-0.189,0.099-0.35,0.229-0.477,0.388 c-0.128,0.159-0.23,0.339-0.308,0.542c-0.079,0.202-0.138,0.407-0.18,0.612c-0.039,0.205-0.065,0.404-0.077,0.598 C60.561,15.669,60.555,15.834,60.555,15.972z","fill":"#000","type":"path"},{"stroke":"none","path":"M65.693,16.775c0.349-0.301,0.633-0.549,0.851-0.748s0.405-0.381,0.561-0.547c0.155-0.165,0.298-0.332,0.425-0.5 c0.128-0.168,0.279-0.367,0.453-0.598c0.175-0.23,0.387-0.512,0.636-0.845s0.573-0.75,0.972-1.247 c0.082-0.113,0.172-0.222,0.271-0.328c0.101-0.105,0.211-0.201,0.332-0.285c0.121-0.084,0.256-0.153,0.402-0.206 c0.146-0.053,0.31-0.08,0.489-0.08c0.3,0,0.53,0.033,0.692,0.099c0.162,0.064,0.28,0.144,0.354,0.237 c0.076,0.094,0.118,0.192,0.131,0.294c0.013,0.103,0.019,0.191,0.019,0.267c0,0.149-0.059,0.314-0.177,0.495 c-0.118,0.18-0.249,0.354-0.394,0.522c-0.143,0.168-0.278,0.322-0.405,0.463c-0.128,0.14-0.201,0.245-0.221,0.313 c0,0.193,0.015,0.369,0.044,0.528c0.027,0.159,0.064,0.314,0.11,0.466c0.047,0.154,0.096,0.316,0.146,0.486 c0.05,0.172,0.098,0.369,0.146,0.594c0.047,0.225,0.084,0.482,0.112,0.776c0.027,0.292,0.042,0.638,0.042,1.036 c0.224-0.148,0.465-0.285,0.724-0.406s0.527-0.248,0.808-0.378c0.28-0.132,0.569-0.276,0.864-0.435 c0.296-0.158,0.594-0.352,0.893-0.575l0.01,2.093c-0.387,0.299-0.833,0.58-1.341,0.842s-1.04,0.492-1.598,0.691 s-1.122,0.357-1.691,0.472c-0.57,0.114-1.11,0.173-1.621,0.173c-0.368,0-0.711-0.034-1.027-0.103 c-0.318-0.069-0.597-0.176-0.837-0.323c-0.239-0.146-0.435-0.338-0.584-0.574s-0.24-0.523-0.271-0.859 c-0.088,0.018-0.173,0.031-0.257,0.037c-0.085,0.006-0.168,0.01-0.248,0.01c-0.101,0-0.193-0.004-0.281-0.01 c-0.086-0.006-0.161-0.029-0.224-0.07c-0.062-0.04-0.111-0.105-0.149-0.196c-0.037-0.089-0.056-0.219-0.056-0.388 c0-0.148,0.038-0.287,0.111-0.416c0.075-0.127,0.162-0.24,0.262-0.341c0.101-0.099,0.2-0.187,0.299-0.261 C65.568,16.877,65.644,16.819,65.693,16.775z M66.89,17.971c0.074,0,0.157,0.047,0.248,0.141s0.194,0.196,0.312,0.308 c0.117,0.112,0.255,0.216,0.411,0.31c0.156,0.092,0.333,0.139,0.533,0.139c0.242,0,0.444-0.039,0.603-0.121 c0.158-0.08,0.284-0.188,0.378-0.322c0.094-0.133,0.158-0.29,0.196-0.467c0.038-0.178,0.056-0.363,0.056-0.555 c0-0.169-0.011-0.34-0.032-0.516c-0.021-0.174-0.05-0.34-0.084-0.5c-0.035-0.158-0.07-0.309-0.113-0.447 c-0.038-0.141-0.076-0.261-0.107-0.36L66.89,17.971z","fill":"#000","type":"path"},{"stroke":"none","path":"M81.849,18.27c-0.515,0.463-1.131,0.654-1.598,0.916s-0.882,0.479-1.247,0.654c-0.364,0.174-0.688,0.305-0.972,0.393 c-0.283,0.087-0.541,0.131-0.771,0.131c-0.475,0-0.892-0.145-1.253-0.43c-0.361-0.286-0.663-0.699-0.906-1.238 s-0.425-1.191-0.547-1.957c-0.121-0.767-0.182-1.629-0.182-2.589c0-0.374,0.016-0.772,0.047-1.196s0.074-0.844,0.131-1.262 c-0.187-0.024-0.332-0.047-0.435-0.07c-0.103-0.022-0.212-0.043-0.327-0.066c-0.116-0.021-0.261-0.044-0.439-0.069 c-0.178-0.025-0.435-0.056-0.77-0.094c-0.15-0.019-0.267-0.055-0.347-0.108c-0.082-0.052-0.139-0.114-0.178-0.187 c-0.037-0.072-0.06-0.146-0.065-0.225c-0.006-0.078-0.01-0.144-0.01-0.201c0-0.125,0.062-0.219,0.183-0.285 c0.121-0.065,0.277-0.113,0.468-0.144c0.19-0.031,0.398-0.049,0.626-0.052c0.228-0.003,0.444-0.001,0.654,0.005 c0.208,0.006,0.395,0.01,0.56,0.014s0.278-0.001,0.341-0.014c0.169-0.841,0.382-1.656,0.641-2.443s0.548-1.489,0.869-2.103 c0.32-0.614,0.672-1.105,1.051-1.477c0.38-0.371,0.779-0.556,1.196-0.556c0.269,0,0.513,0.075,0.733,0.224 c0.221,0.15,0.41,0.349,0.565,0.598c0.156,0.249,0.274,0.541,0.36,0.874c0.083,0.333,0.125,0.681,0.125,1.042 c0,0.305-0.043,0.628-0.131,0.968c-0.086,0.339-0.204,0.685-0.354,1.037c-0.15,0.352-0.325,0.709-0.527,1.07 c-0.203,0.361-0.416,0.719-0.641,1.075c0.056,0.006,0.149,0.011,0.28,0.014c0.131,0.003,0.282,0.008,0.453,0.014 c0.172,0.007,0.355,0.014,0.556,0.023c0.2,0.01,0.393,0.017,0.58,0.023c0.187,0.007,0.361,0.013,0.522,0.019 c0.162,0.007,0.297,0.013,0.401,0.019c0.126,0.006,0.217,0.068,0.271,0.187c0.057,0.119,0.084,0.268,0.084,0.449 c0,0.218-0.062,0.395-0.187,0.533c-0.125,0.137-0.262,0.205-0.411,0.205h-3.588c-0.181,0.25-0.363,0.494-0.546,0.734 c-0.184,0.24-0.354,0.456-0.51,0.649c-0.025,0.387-0.046,0.766-0.065,1.14c-0.007,0.162-0.013,0.329-0.019,0.5 c-0.008,0.172-0.013,0.342-0.019,0.51c-0.007,0.168-0.012,0.329-0.015,0.485c-0.003,0.155-0.005,0.3-0.005,0.431 c0,0.336,0.03,0.619,0.094,0.85c0.062,0.23,0.152,0.419,0.271,0.564c0.118,0.147,0.263,0.254,0.436,0.318 c0.17,0.064,0.361,0.098,0.573,0.098c0.13,0,0.295-0.03,0.49-0.094c0.196-0.062,0.411-0.146,0.645-0.255 c0.233-0.11,0.479-0.239,0.738-0.389s0.515-0.313,0.767-0.49c0.252-0.179,0.494-0.364,0.724-0.562 c0.23-0.196,0.353-0.385,0.63-0.364c0.327,0.024,0.434,0.415,0.434,0.998C82.286,17.68,82.078,18.064,81.849,18.27z M78.859,6.441 c0-0.068-0.005-0.145-0.015-0.229c-0.009-0.084-0.029-0.164-0.06-0.239c-0.032-0.075-0.08-0.137-0.146-0.187 s-0.157-0.075-0.276-0.075c-0.161,0-0.325,0.144-0.49,0.43c-0.165,0.286-0.323,0.653-0.478,1.098 c-0.151,0.445-0.295,0.936-0.428,1.472c-0.135,0.536-0.259,1.056-0.37,1.56c0.095,0.013,0.188,0.023,0.28,0.033 c0.094,0.009,0.19,0.02,0.29,0.032c0.187-0.317,0.382-0.662,0.584-1.032s0.385-0.734,0.547-1.093 c0.161-0.358,0.296-0.693,0.401-1.004C78.807,6.896,78.859,6.64,78.859,6.441z","fill":"#000","type":"path"},{"stroke":"none","path":"M45.524,17.69c3.115,2.119,10.077,6.541,10.077,6.541c0.808,0.568,1.003,1.684,0.435,2.491l-0.855,1.221 c-0.568,0.808-1.684,1.003-2.492,0.435c0,0-6.606-5.31-9.591-7.489","fill":"#EE3A24","type":"path"},{"stroke":"none","path":"M48.455,13.959c0,6.853-5.555,12.408-12.407,12.408c-6.853,0-12.408-5.555-12.408-12.408 c0-6.852,5.555-12.407,12.408-12.407C42.9,1.553,48.455,7.107,48.455,13.959z M36.01,4.624c-5.176,0-9.374,4.197-9.374,9.373 c0,5.177,4.197,9.375,9.374,9.375c5.177,0,9.374-4.197,9.374-9.375C45.383,8.82,41.187,4.624,36.01,4.624z","fill":"#EE3A24","type":"path"},{"stroke":"none","path":"M32,9h8.797c0,0-4.276-4.691-8.87-0.147","fill":"#000","type":"path"},{"stroke":"none","path":"M84.044,20.385c-0.591,0-1.108-0.106-1.551-0.32c-0.443-0.213-0.812-0.501-1.108-0.862 c-0.295-0.361-0.517-0.779-0.664-1.254c-0.148-0.475-0.222-0.973-0.222-1.494c0-0.353,0.034-0.725,0.104-1.117 c0.069-0.393,0.175-0.778,0.315-1.155c0.142-0.377,0.319-0.737,0.533-1.08s0.463-0.644,0.749-0.905 c0.286-0.261,0.606-0.468,0.962-0.622c0.355-0.154,0.75-0.231,1.184-0.231c0.352,0,0.679,0.057,0.98,0.169 c0.302,0.113,0.563,0.272,0.787,0.476c0.223,0.205,0.397,0.451,0.523,0.74c0.125,0.289,0.188,0.613,0.188,0.971 c0,0.39-0.097,0.779-0.288,1.169s-0.457,0.757-0.797,1.103c-0.339,0.345-0.743,0.654-1.211,0.923 c-0.469,0.271-0.976,0.481-1.522,0.633c0.094,0.169,0.187,0.311,0.278,0.424c0.091,0.113,0.184,0.201,0.277,0.264 c0.095,0.062,0.193,0.107,0.297,0.133c0.104,0.024,0.216,0.037,0.335,0.037c0.377,0,0.774-0.076,1.192-0.227 s0.825-0.34,1.222-0.565c0.396-0.226,0.77-0.473,1.121-0.74c0.353-0.267,0.65-0.521,0.896-0.759l1.217,1.264 c-0.554,0.572-1.141,1.078-1.763,1.518c-0.271,0.188-0.562,0.374-0.872,0.557c-0.312,0.182-0.639,0.344-0.98,0.484 c-0.343,0.143-0.698,0.256-1.065,0.34C84.793,20.343,84.421,20.385,84.044,20.385z M82.79,15.954c0.226,0,0.473-0.058,0.74-0.174 c0.267-0.116,0.515-0.265,0.744-0.448c0.229-0.182,0.423-0.38,0.58-0.594c0.157-0.214,0.235-0.421,0.235-0.623 c0-0.283-0.052-0.515-0.155-0.697c-0.104-0.183-0.231-0.273-0.382-0.273c-0.271,0-0.501,0.05-0.693,0.151 c-0.191,0.101-0.352,0.231-0.48,0.391s-0.232,0.343-0.311,0.547c-0.079,0.204-0.139,0.41-0.18,0.617 c-0.041,0.208-0.067,0.409-0.08,0.604S82.79,15.816,82.79,15.954z","fill":"#000","type":"path"},{"stroke":"none","path":"M98.911,18.537c-0.446,0.346-0.886,0.654-1.319,0.924c-0.183,0.113-0.374,0.225-0.575,0.335s-0.399,0.208-0.594,0.292 c-0.195,0.086-0.386,0.154-0.57,0.208c-0.186,0.054-0.357,0.08-0.515,0.08c-0.088,0-0.218-0.019-0.391-0.057 s-0.361-0.114-0.565-0.231c-0.205-0.115-0.409-0.283-0.613-0.504s-0.382-0.512-0.532-0.877c-0.233,0.227-0.479,0.441-0.74,0.646 c-0.261,0.203-0.531,0.381-0.811,0.532c-0.28,0.151-0.563,0.272-0.849,0.362c-0.286,0.092-0.574,0.137-0.863,0.137 c-0.408,0-0.762-0.088-1.061-0.264c-0.298-0.176-0.547-0.41-0.744-0.702c-0.198-0.292-0.346-0.624-0.443-0.995 c-0.098-0.37-0.146-0.754-0.146-1.15c0-0.401,0.052-0.809,0.156-1.221c0.104-0.411,0.254-0.81,0.452-1.197s0.438-0.751,0.722-1.094 c0.282-0.342,0.603-0.647,0.961-0.915c0.358-0.267,0.748-0.488,1.169-0.665c0.421-0.176,0.871-0.286,1.349-0.33 c0.019-0.805,0.091-1.6,0.217-2.385c0.125-0.786,0.292-1.534,0.499-2.244c0.208-0.71,0.451-1.367,0.731-1.97 c0.279-0.604,0.586-1.125,0.919-1.565s0.688-0.784,1.065-1.032s0.767-0.373,1.169-0.373c0.295,0,0.547,0.077,0.754,0.231 c0.208,0.154,0.376,0.358,0.505,0.613c0.128,0.255,0.222,0.55,0.277,0.886c0.057,0.336,0.085,0.684,0.085,1.042 c0,0.22-0.009,0.446-0.028,0.679c-0.081,0.886-0.232,1.724-0.452,2.512c-0.22,0.789-0.478,1.557-0.773,2.305 c-0.295,0.748-0.615,1.49-0.961,2.225s-0.683,1.499-1.009,2.291c-0.032,0.088-0.063,0.195-0.095,0.321 c-0.031,0.126-0.062,0.263-0.09,0.41s-0.052,0.299-0.07,0.453c-0.019,0.153-0.028,0.303-0.028,0.447 c0,0.182,0.011,0.355,0.033,0.519c0.021,0.163,0.058,0.31,0.108,0.438c0.05,0.129,0.118,0.23,0.202,0.307 c0.085,0.074,0.19,0.113,0.316,0.113c0.119,0,0.25-0.024,0.391-0.071c0.142-0.048,0.291-0.112,0.448-0.193s0.315-0.175,0.477-0.278 c0.16-0.104,0.315-0.209,0.466-0.315c0.346-0.251,0.707-0.538,1.085-0.858L98.911,18.537z M92.425,13.258 c-0.414,0.201-0.784,0.467-1.107,0.797s-0.594,0.687-0.811,1.07c-0.217,0.384-0.382,0.77-0.495,1.16s-0.17,0.741-0.17,1.056 c0,0.126,0.015,0.252,0.043,0.377c0.028,0.127,0.08,0.239,0.155,0.34s0.183,0.182,0.32,0.245c0.139,0.063,0.317,0.095,0.537,0.095 c0.113,0,0.225-0.029,0.335-0.086s0.216-0.13,0.316-0.221c0.1-0.092,0.196-0.195,0.287-0.312s0.175-0.237,0.25-0.362 c0.176-0.289,0.336-0.616,0.48-0.98c-0.019-0.088-0.034-0.229-0.047-0.42c-0.013-0.192-0.022-0.405-0.028-0.641 c-0.007-0.236-0.013-0.479-0.019-0.73c-0.007-0.251-0.012-0.481-0.015-0.688s-0.008-0.377-0.014-0.509 C92.438,13.314,92.432,13.252,92.425,13.258z M96.856,6.423c0.037-0.44,0.057-0.789,0.057-1.046c0-0.339-0.03-0.575-0.09-0.707 s-0.146-0.198-0.26-0.198c-0.201,0-0.383,0.127-0.546,0.382c-0.164,0.254-0.309,0.58-0.435,0.976 c-0.125,0.396-0.235,0.833-0.329,1.311c-0.095,0.478-0.174,0.939-0.236,1.386s-0.113,0.849-0.15,1.207 c-0.038,0.358-0.063,0.613-0.075,0.764c-0.025,0.308-0.046,0.605-0.062,0.891s-0.027,0.547-0.033,0.782 c-0.007,0.236-0.01,0.442-0.01,0.618s0,0.311,0,0.405v0.094c0.358-0.817,0.688-1.631,0.99-2.441 c0.126-0.346,0.253-0.708,0.382-1.089s0.246-0.762,0.354-1.146c0.106-0.383,0.199-0.761,0.278-1.131 C96.77,7.108,96.824,6.756,96.856,6.423z","fill":"#000","type":"path"}];
		RaphaelToScale(requestedSVG);

		// ///shopping cart
		// var shoppingCartSVG=["cartImg-checkout",50,50,{"stroke":"none","path":"M2,16.54 9.333,16.54 17.231,32.899 36.693,32.899 45.154,18.232 40.078,18.232 34.719,28.949 \r\n\t\t20.051,28.949 11.872,12.026 2,12.026 \tz","fill":"#000","type":"path"},{"stroke":"none","fill":"#000","type":"circle","cx":19.487,"cy":38.259,"r":2.82},{"stroke":"none","fill":"#000","type":"circle","cx":35.282,"cy":37.976,"r":2.539}];
		// RaphaelToScale(shoppingCartSVG);
	},
	countItems: function(res){
		var total = 0;
		for (i in res.Cart){
			var item = res.Cart[i];
			total += parseFloat(item.quantity);

		}
		this.numItems = total;
		$('.cart-numItems').html(total);
		$('.cart-itemCounter').html(total);
	},
	addItem: function(item){
		var self = this;
		var params = {
			'Item.1.ASIN': item.ASIN,
			'Item.1.Quantity': item.Quantity
		};
		if(this.CartId){// add to cart
			params.Operation = 'CartAdd';
			params.CartId = this.CartId;
			params.HMAC = this.HMAC;
		}else{// new cart
			params.Operation = 'CartCreate';
		}

		// send amazon request
		$.ajax({type:'POST', dataType:'json', 
			data: {params: params},
			url:CONF['api_host']+'/php/amazonRequest.php', 
			success:function(res){
				self.CartId = res.CartId;
				self.HMAC = res.HMAC;
				self.Subtotal = res.Subtotal;
				self.PurchaseUrl = res.PurchaseUrl;
				self.add(res.Item);

				self.countItems(res);

				// show cart icon
				$('#amazon-cart-tab').fadeIn(300);
				$('.cart-checkout-btn').click(function(){
					var a = document.createElement('a');
					$(a).attr({href: res.PurchaseUrl, target:'_blank'});
					window.open($(a).attr('href'));
					$(a).remove();
				});

			}, 
			error:function(err){
				alert(err.responseText);
			}
		});
	},
	showCheckout: function(){
		$(this.fullContainer).fadeIn(500);
	},
	getContents: function(){
		App.popcorn.pause();
		var self = this;
		var params = {Operation: 'CartGet',
					CartId: this.get('CartId'),
					HMAC: this.get('HMAC')}

		$.ajax({type:'POST', dataType:'json', 
			data: {params: params},
			url: CONF['api_host']+'/php/amazonRequest.php', 
			success:function(res){
				self.set(res.Items);

				self.set({'Items': res.Items, 'CartId': res.CartId, 'HMAC':res.HMAC, 'Subtotal': res.Subtotal, 'PurchaseUrl': res.PurchaseUrl});
				
				// render the full container items
				
				var out = '';
				for(i in res.Items){
					var item = res.Items[i];
					out += "<div class='cart-row'>"+
								"<div class='col c1'><div style='background: url("+item.img+"); background-size:100% 100%;' class='cart-img'/></div>"+
								"<div class='col c2'>"+item.title+"</div>"+
								"<div class='col c3'>"+item.price+"</div>"+
								"<div class='col c4'><div class='q-minus'></div>"+item.quantity+"<div class='q-plus'></div></div>"+
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

var ItemView = Backbone.View.extend({
	tagName: "div",
	className: "cart-row",
	events: {
		"blur .item-quantity": "changeQuantity",
		"focus .item-quantity": "focusQuantity",
		"click .item-delete": "deleteItem"
	},
	initialize: function(){

		$('.cart-contents').append(this.el);

		this.render();
		var self = this;

		this.listenTo(this.model, "change", this.render);
	},
	render: function(){
		var out = "<div class='col c1'><img src='"+this.model.get('img')+"' class='cart-img'/></div>"+
					"<div class='col c2'>"+
						"<div class='item-name'>"+this.model.get('title')+"</div>"+
						"<div class='item-availability'>in Stock</div>"+
						"<div class='item-shipment amazon-gray'>Shipped from: <span class='amazon-blue'>"+this.model.get('seller')+"</span></div>"+
						"<div class='item-giftoptions amazon-gray'>Gift options available</div>"+
						"<div class='item-delete'>Delete</div>"+
					"</div>"+
					"<div class='col c3'>"+this.model.get('price')+"</div>"+
					"<div class='col c4'><input class='item-quantity' value="+this.model.get('quantity')+"></div>";
		this.el.innerHTML = out;

		// var self = this;
		// $(this).find('.item-quantity').bind("change", function(e){
		// 	self.changeQuantity(e);
		// });

	},
	deleteItem: function(){
		this.model.destroy();
	},
	focusQuantity: function(){
		App.onTextInput = true;
	},
	changeQuantity: function(e){
		App.onTextInput = false;
		var value = $(e.currentTarget).val();
		this.model.changeQuantity({CartItemId: this.model.get('CartItemId'), Quantity: value});
	},
	destroy: function(){
		$(this.el).remove();
	}
})