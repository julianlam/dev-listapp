<?php
	class App {
		public function getItems() {
			$db = new dbx();
			return $db->run("SELECT * FROM items ORDER BY datetime ASC")->fetchall();
		}
	}
?>
