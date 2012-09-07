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
					} else {
						alert('!!');
					}
				}
			}).post({
				action: 'toggle',
				itemID: this.get('itemID')
			});
		}
	}),
	itemEl: Backbone.View.extend({
		tagName: 'li',
		initialize: function() {
			this.model.bind('change', this.render, this);
			this.el.set('html',
				'<button type="button"><img src="./images/edit.gif" /></button>' +
				'<span>' + this.model.get('label') + '</span>'
			);
		},
		events: {
			'touchend button': 'changeName',
			'click button': 'changeName',
			'touchend': 'toggle',
			'click': 'toggle',
		},
		render: function() {
			if (this.model.get('done') && !this.el.hasClass('done')) this.el.addClass('done');
			else if (!this.model.get('done')) this.el.removeClass('done');

			this.el.getElement('span').set('html', this.model.get('label'));

			return this;
		},
		changeName: function(e) {
			if (!this.clickCatch) {
				var	newName = prompt("Please enter the new name for this item", this.model.get('label')),
					_item = this;

				this.clickCatch = true;
				setTimeout(function() { _item.clickCatch = false }, 500);

				if (newName !== this.model.get('label') && newName.length > 0) {
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
		}
	}),
	listApp: Backbone.View.extend({
		tagName: 'body',
		initialize: function() {
			this.list = this.el.getElement('#itemList');
			this.getList();
		},
		events: {
			'touchend [data-action="new"]': 'create'
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
		create: function() {
			var _app = this;

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
	})
}
