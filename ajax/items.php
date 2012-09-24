<?php
	require_once '../lib/db.class.php';
	require_once '../lib/app.class.php';
	require_once '../lib/items.class.php';

	if ($_SERVER['REQUEST_METHOD'] == 'GET' || $_SERVER['REQUEST_METHOD'] == 'POST') {
		switch($_REQUEST['action']) {
			case 'toggle':
				$items = new Items();
				echo $items->toggle($_POST['guid']) ? 'true' : 'false';
			break;
			case 'new_item':
				$items = new Items();
				echo json_encode($items->create($_POST['guid']));
			break;
			case 'edit_label':
				$items = new Items();
				echo $items->changeLabel($_POST['guid'], $_POST['label']) ? 'true' : 'false';
			break;

			default:
				$guid = $_REQUEST['guid'];
				if (strlen($guid) > 0) {
					$items = new Items();
					echo json_encode($items->get($guid));
				} else {
					$app = new App();
					echo json_encode($app->getItems());	
				}
			break;
		}
	} else if ($_SERVER['REQUEST_METHOD'] == 'DELETE') {
		$items = new Items();
		$guid = $_REQUEST['guid'];
		$delete = $items->delete($guid);
		if ($delete) {
			echo json_encode(array(
				"status" => 1,
				"guid" => $guid
			));
		} else header("Status: 404 Not Found");
	}
?>
