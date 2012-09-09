<?php
	class App {
		public function getItems() {
			$db = new dbx();
			return $db->run("SELECT * FROM items WHERE !deleted ORDER BY datetime ASC")->fetchall();
		}
	}
?>
