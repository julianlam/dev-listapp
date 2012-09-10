<?php
	class App {
		public function getItems() {
			$db = new dbx();
			return $db->run("SELECT * FROM items WHERE !deleted ORDER BY done, lastEdited ASC")->fetchall();
		}
	}
?>
