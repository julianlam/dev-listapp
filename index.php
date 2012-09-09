<html>
	<head>
		<script language="javascript" src="js/mootools.js" type="text/javascript"></script>
		<!--<script language="javascript" src="js/mootools-more.js" type="text/javascript"></script>-->
		<script src="js/MooToolsAdapter.js"></script>
		<script language="javascript" src="js/underscore.js" type="text/javascript"></script>
		<script language="javascript" src="js/backbone.js" type="text/javascript"></script>
		<script language="javascript" src="js/list.js" type="text/javascript"></script>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<meta name="HandheldFriendly" content="true" />
		<meta name="viewport" content="width=300,minimum-scale=1.0,maximum-scale=1.0" />
	</head>
	<body data-site="<?=$site?>">
		<div class="modal-overlay"></div>
		<div class="options">
			<button data-action="new">New Item</button>
		</div>
		<div class="clear"></div>
		<ul id="itemList"></ul>
		<script>
			window.addEvent('domready', function() {
				// Decide whether to use clicks or touchends
				var siteType = document.body.getProperty('data-site');

				window.appInstance = new ItemList.listApp({ el: document.body });
			});
		</script>
	</body>
</html>
