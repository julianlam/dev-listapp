<?php
	/**
	 * FeedSeed database connection class
	 */
	require_once 'config.inc.php';

	class dbx extends PDO {
		public $fetch_mode = PDO::FETCH_ASSOC;

		function __construct() {
			// Attempt a database connection, otherwise, error out
			try {
				parent::__construct(DB_DSN, DB_USER, DB_PASS, array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));
			} catch (Exception $e) {
				die("<body style=\"background: #efefef;\"><div style=\"text-align: center; margin: 0 auto; width: 640px; padding: 10px; margin-top: 30px; border: 1px solid #666;\"><img src=\"http://fjp9e4aa.joyent.us/julian/storemarker/images/error.png\" /><br /><b>Error</b>: A connection to the ListApp database could not be established.<br /><br /><i><small>Attempted: " . DB_DSN . "</small></i></div></body>");
			}
		}

		/**
		* run() - Prepare and execute a single query
		*/
		function run() {
			$params = func_get_args();
			$sql = array_shift($params);
			if (isset($params[0]) && is_array($params[0])) {
				$params = $params[0];
			}

			$st = $this->prepare($sql);

			// Filter to add inputs to bindParams properly (quotes for strings, straight input for ints)
			foreach ($params as $key => &$param) {
				if (is_int($param)) {
					$param = intval($param);
					$st->bindParam($key, $param, PDO::PARAM_INT);
				}
				else $st->bindParam($key, $param);
				unset($params[$key]);
			}
			$st->setFetchMode($this->fetch_mode);

			$st->execute();

			return $st;
		}

		/**
		* runPrepared() - Prepare a query and execute it as many times as there are elements in the $params
		*/
		function runPrepared() {
			$params_array = func_get_args();
			$sql = array_shift($params_array);
			if (isset($params_array[0]) && is_array($params_array[0])) {
				$st = $this->prepare($sql);
				$st->setFetchMode($this->fetch_mode);

				// Filter to add inputs to bindParams properly (quotes for strings, straight input for ints)
				foreach($params_array[0] as $params) {
					foreach ($params as $key => &$param) {
						if (is_int($param)) {
							$param = intval($param);
							$st->bindParam($key, $param, PDO::PARAM_INT);
						}
						else $st->bindParam($key, $param);
						unset($params[$key]);
					}
					$st->execute();
				}

				return $st;
			}
			return array("status" => 0, "comment" => "Improper params format received");
		}

		function last() {
			return $this->lastInsertId();
		}
	}
?>
