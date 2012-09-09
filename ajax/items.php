<?php
	require_once '../lib/db.class.php';
	require_once '../lib/app.class.php';
	require_once '../lib/items.class.php';

	switch($_REQUEST['action']) {
		case 'get_items':
			$app = new App();
			echo json_encode($app->getItems());
		break;
		case 'toggle':
			$items = new Items();
			echo $items->toggle($_POST['itemID']) ? 'true' : 'false';
		break;
		case 'new_item':
			$items = new Items();
			echo json_encode($items->create());
		break;
		case 'edit_label':
			$items = new Items();
			echo $items->changeLabel($_POST['itemID'], $_POST['label']) ? 'true' : 'false';
		break;
		case 'set_deleted':
			$items = new Items();
			echo $items->setDeleted($_POST['itemID']) ? 'true' : 'false';
		break;

		default:
			echo json_encode(array(
				"status" => 0,
				"comment" => "No action requested. Halting."
			));
		break;
	}
?>
