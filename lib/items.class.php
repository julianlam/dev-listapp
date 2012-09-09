<?php
	class Items {
		public function toggle($itemID) {
			$db = new dbx();
			$toggle = $db->run("UPDATE items SET done=done XOR 1 WHERE itemID=:itemID", array(
				"itemID" => $itemID
			));

			if ($toggle->rowCount() > 0) return true;
			else return false;
		}

		public function create() {
			$db = new dbx();
			$item = $db->run("INSERT INTO items (text, datetime) VALUES ('New Item', :time)", array(
				"time" => time()
			));
			$itemID = $db->last();

			if ($itemID > 0) {
				return array(
					"status" => 1,
					"itemID" => $itemID
				);
			} else {
				return array(
					"status" => 0
				);
			}
		}

		public function changeLabel($itemID, $new_text) {
			$db = new dbx();
			$update = $db->run("UPDATE items SET text=:text WHERE itemID=:itemID", array(
				"itemID" => $itemID,
				"text" => $new_text
			));

			if ($update->rowCount() > 0) {
				return true;
			} else {
				return false;
			}
		}

		public function setDeleted($itemID) {
			$db = new dbx();
			$delete = $db->run("UPDATE items SET deleted=1 WHERE itemID=:itemID", array(
				"itemID" => $itemID
			));

			if ($delete->rowCount() > 0) {
				return true;
			} else {
				return false;
			}
		}
	}
?>
