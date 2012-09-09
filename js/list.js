var ItemList = {
	item: Backbone.Model.extend({
		defaults: {
			label: 'New Item',
			done: false
		},
		initialize: function() {
			// ...
		},
		toggle: function() {
			var	_model = this,
				newState = this.get('done') ^ 1;

			new Request({
				url: 'ajax/items.php',
				onSuccess: function(data) {
					if (data == 'true') {
						_model.set({
							done: newState
						});
					}
				}
			}).post({
				action: 'toggle',
				itemID: this.get('itemID')
			});
		},
		remove: function() {
			new Request({
				url: 'ajax/items.php'
			}).post({
				action: 'set_deleted',
				itemID: this.get('itemID')
			});
		}
	}),
	itemEl: Backbone.View.extend({
		tagName: 'li',
		initialize: function() {
			this.model.on('change', this.render, this);
			this.el.set('html',
				'<button data-action="edit" type="button"><img src="./images/edit.gif" /></button>' +
				'<button data-action="set_deleted" type="button"><img src="./images/delete.png" /></button>' +
				'<span>' + this.model.get('label') + '</span>'
			);
		},
		events: {
			'touchend button[data-action="edit"]': 'changeName',
			'click button[data-action="edit"]': 'changeName',
			'click button[data-action="set_deleted"]': 'set_deleted',
			'touchend button[data-action="set_deleted"]': 'set_deleted',
			'touchend': 'show_details',
			'mousedown': 'show_details'
		},
		render: function() {
			if (this.model.get('done') && !this.el.hasClass('done')) this.el.addClass('done');
			else if (!this.model.get('done')) this.el.removeClass('done');

			this.el.getElement('span').set('html', this.model.get('label'));

			return this;
		},
		changeName: function() {
			if (!this.clickCatch) {
				var	newName = prompt("Please enter the new name for this item", this.model.get('label')),
					_item = this;

				this.clickCatch = true;
				setTimeout(function() { _item.clickCatch = false }, 500);

				if (newName && newName !== this.model.get('label') && newName.length > 0) {
					new Request({
						url: 'ajax/items.php',
						onSuccess: function(data) {
							if (data == 'true') {
								_item.model.set('label', newName);
							}
						}
					}).post({
						action: 'edit_label',
						itemID: _item.model.get('itemID'),
						label: newName
					});
				}
			}
		},
		toggle: function(e) {
			if (!this.clickCatch) {
				var _item = this;
				this.clickCatch = true;
				setTimeout(function() { _item.clickCatch = false }, 500);

				if (e.target.nodeName != 'BUTTON' && e.target.nodeName != 'IMG') {
					this.model.toggle();
				}
			}
		},
		set_deleted: function() {
			if (!this.clickCatch) {
				var _item = this;
				this.clickCatch = true;
				setTimeout(function() { _item.clickCatch = false }, 500);

				var confirm = window.confirm('Are you sure you wish to delete this item?');
				if (confirm) {
					this.model.remove();
					this.remove();
				}
			}
		},
		show_details: function(e) {
			if (e.target.nodeName != 'BUTTON' && e.target.nodeName != 'IMG') {
				var detailsView = appInstance.itemDetailsView;
				detailsView.model = this.model;
				detailsView.render();
			}
		}
	}),
	listApp: Backbone.View.extend({
		initialize: function() {
			var _app = this;
			this.list = this.el.getElement('#itemList');
			this.getList();
			this.itemDetailsView = new ItemList.itemDetailsView;
		},
		events: {
			'touchend [data-action="new"]': 'create',
			'click [data-action="new"]': 'create'
		},
		addToView: function(attr) {
			var item = new ItemList.item(attr);
			var view = new ItemList.itemEl({ model: item });
			view.render().el.inject(this.list, 'bottom');

			return item;
		},
		getList: function() {
			var _app = this;

			new Request.JSON({
				url: 'ajax/items.php',
				onSuccess: function(data) {
					if (data.length) {
						data.each(function(item) {
							var model = _app.addToView({
								itemID: item.itemID,
								label: item.text,
								done: item.done == 1 ? true : false
							});
						});
					}
				}
			}).get({
				action: 'get_items'
			});
		},
		create: function(e) {
			if (!this.clickCatch) {
				var _app = this;
				this.clickCatch = true;
				setTimeout(function() { delete _app.clickCatch }, 500);

				new Request.JSON({
					url: 'ajax/items.php',
					onSuccess: function(data) {
						if (data.status) {
							_app.addToView({
								itemID: data.itemID
							});
						}
					}
				}).post({
					action: 'new_item'
				});
			}
		}
	}),
	itemDetailsView: Backbone.View.extend({
		template: _.template(
			'<div class="container">' +
				'<div class="closeBtn"></div>' +
				'<h2><%= label %></h2>' +
				'<p><%= label %></p>' +
			'</div>'
		),
		className: 'itemDetails',
		initialize: function() {
			
		},
		events: {
			'click .closeBtn': 'hide'
		},
		render: function() {
			var	_view = this,
				browserDim = ItemList.getViewportDimensions()
				overlayEl = document.body.getElement('.modal-overlay');
			this.el.set('html', this.template({ label: this.model.get('label') }));

			this.el.inject(document.body);

			// Positioning
			//var modalDim = this.el.getDimensions();
			this.el.setStyles({
				left: browserDim[0] * 0.05,
				top: browserDim[1] * 0.05
			});
			overlayEl.setStyle('display', 'block');
			setTimeout(function() {
				overlayEl.addEvent('click', function() {
					_view.hide();
				});
				window.addEvent('keydown', function(e) {
					if (e.key === 'esc') {
						_view.hide();
					}
				});
			}, 500);

			return this;
		},
		hide: function() {
			this.remove();
			document.body.getElement('.modal-overlay').setStyle('display', 'none').removeEvents();
			window.removeEvents('keydown');
		}
	}),
	getViewportDimensions: function() {
		var browserWidth, browserHeight;

		if (window.innerWidth && window.innerHeight) {	// The REAL browsers
			browserWidth = window.innerWidth;
			browserHeight = window.innerHeight;
		}
		else if (document.compatMode=='CSS1Compat' &&	// IE Standard
			document.documentElement &&
			document.documentElement.offsetWidth ) {
			browserWidth = document.documentElement.offsetWidth;
			browserHeight = document.documentElement.offsetHeight;
		}
		else if (document.body && document.body.offsetWidth) {	// IE Quirks
			browserWidth = document.body.offsetWidth;
			browserHeight = document.body.offsetHeight;
		}
		else {
			browserWidth = 1280;
			browserHeight = 1024;
		}

		return [browserWidth, browserHeight];
	}
}
