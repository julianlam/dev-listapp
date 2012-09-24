<?php
	class Items {
		public function get($guid) {
			$db = new dbx();
			return $db->run("SELECT * FROM items WHERE guid=:guid", array("guid" => $guid))->fetch();
		}

		public function toggle($guid) {
			$db = new dbx();
			$toggle = $db->run("UPDATE items SET done=done XOR 1 WHERE guid=:guid", array(
				"guid" => $guid
			));

			if ($toggle->rowCount() > 0) return true;
			else return false;
		}

		public function create($guid) {
			$db = new dbx();
			$item = $db->run("INSERT INTO items (guid, label, lastEdited) VALUES (:guid, 'New Item', :time)", array(
				"guid" => $guid,
				"time" => time()
			));

			$status = $item->errorInfo();
			if ($status[0] == '00000') return array("status" => 1);
			else return array("status" => 0);
		}

		public function changeLabel($guid, $new_text) {
			$db = new dbx();
			$update = $db->run("UPDATE items SET label=:label WHERE guid=:guid", array(
				"guid" => $guid,
				"label" => $new_text
			));

			if ($update->rowCount() > 0) {
				return true;
			} else {
				return false;
			}
		}

		public function delete($guid) {
			$db = new dbx();
			$delete = $db->run("UPDATE items SET deleted=1 WHERE guid=:guid", array(
				"guid" => $guid
			));

			if ($delete->rowCount() > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
?>
