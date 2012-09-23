var ItemList = {
	item: Backbone.Model.extend({
		idAttribute: "guid",
		defaults: {
			label: 'New Item',
			done: false
		},
		initialize: function() {
			if (!this.get('guid')) {
				// Generate one
				this.set({
					guid: this.generateGUID(),
					silent: true
				});
				this.set('silent', false);
			}
			if (typeOf(this.get('done')) !== 'boolean') {
				if (this.get('done') === '1') this.set('done', true);
				else this.set('done', false);
			}

			this.on('change', this.updateStore);

			this.url = './items/' + this.get('guid');
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
		generateGUID: function() {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});
		},
		updateStore: function() {
			this.collection.updateStore();
		},
		changeLabel: function() {
			var	newName = prompt("Please enter the new name for this item", this.get('label')),
			_item = this;

			if (newName && newName !== this.get('label') && newName.length > 0) {
				new Request({
					url: 'ajax/items.php',
					onSuccess: function(data) {
						if (data == 'true') {
							_item.set('label', newName);
						}
					}
				}).post({
					action: 'edit_label',
					guid: _item.get('guid'),
					label: newName
				});
			}
		}
	}),
	list: Backbone.Collection.extend({
		initialize: function() {
			this.on('reset', this.render);
			this.on('remove', this.updateStore);
			this.on('add', this.updateStore);
		},
		render: function() {
			localStorage.setItem('items', JSON.encode(this.toJSON()));
			this.models.each(function(item) {
				var view = new ItemList.itemEl({ model: item });
				view.render().el.inject(document.body.getElement('#itemList'));
			});
		},
		updateStore: function() {
			localStorage.setItem('items', JSON.encode(this.toJSON()));
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
				this.clickCatch = true;
				setTimeout(function() { _item.clickCatch = false }, 500);

				this.model.changeLabel();
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
					this.model.destroy({
						success: function() {
							_item.el.destroy();
						},
						error: function() {
							// ...
						}
					});
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

			this.itemDetailsView = new ItemList.itemDetailsView;

			// Collection of list items
			this.listCollection = new ItemList.list();
			this.listCollection.model = ItemList.item;
			if (localStorage.getItem('items')) {
				console.log('localStorage');
				this.listCollection.reset(JSON.decode(localStorage.getItem('items')));
			} else {
				console.log('xhr');
				this.listCollection.url = './items/';
				this.listCollection.fetch();
			}
		},
		events: {
			'touchend [data-action="new"]': 'create',
			'click [data-action="new"]': 'create'
		},
		addToView: function(attr) {
			var	item = new ItemList.item(attr),
				view = new ItemList.itemEl({ model: item }),
				_app = this;

			view.render().el.inject(this.list, 'bottom');
			this.listCollection.add(item);

			return item;
		},
		create: function(e) {
			if (!this.clickCatch) {
				var _app = this;
				this.clickCatch = true;
				setTimeout(function() { delete _app.clickCatch }, 500);

				var newItem = _app.addToView();

				new Request.JSON({
					url: 'ajax/items.php',
					onSuccess: function(data) {
						if (data.status) {
							// ...
						}
					}
				}).post({
					action: 'new_item',
					guid: newItem.get('guid')
				});
			}
		}
	}),
	itemDetailsView: Backbone.View.extend({
		template: _.template(
			'<div class="container">' +
				'<div class="closeBtn"></div>' +
				'<h2><%= label %></h2>' +
				'<table class="zebra">' +
					'<tbody>' +
						'<tr>' +
							'<td data-action="edit">' +
								'Edit Label' +
							'</td>' +
						'</tr>' +
						'<tr>' +
							'<td>' +
								'<input type="checkbox" />' +
								'Done' +
							'</td>' +
						'</tr>' +
					'</tbody>' +
				'</table>' +
			'</div>'
		),
		className: 'itemDetails',
		initialize: function() {

		},
		events: {
			'click .closeBtn': 'hide',
			'click td[data-action="edit"]': 'changeLabel'
		},
		refresh: function() {
			this.el.set('html', this.template({ label: this.model.get('label') }));
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

			this.model.on('change', this.refresh, this);

			return this;
		},
		hide: function() {
			this.remove();
			document.body.getElement('.modal-overlay').setStyle('display', 'none').removeEvents();
			window.removeEvents('keydown');
			this.model.off('change', this.refresh);
		},
		changeLabel: function() {
			this.model.changeLabel();
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
