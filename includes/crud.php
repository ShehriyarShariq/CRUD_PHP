<?php 
	include_once "db_connect.php";	# Load Database connection file

	if(isset($_POST)){
		function getAllData($connect){ # Read All Data From DB
			$allBooksQuery = "SELECT * FROM book ORDER BY timestamp";
			$allAuthorsQuery = "SELECT * FROM author ORDER BY timestamp";
	
			$allBooksQueryResult = mysqli_query($connect, $allBooksQuery);
			$allBooksQueryResultCheck = mysqli_num_rows($allBooksQueryResult);
	
			$allAuthorsQueryResult = mysqli_query($connect, $allAuthorsQuery);
			$allAuthorsQueryResultCheck = mysqli_num_rows($allAuthorsQueryResult);
	
			$books = array();
			$authors = array();
	
			if($allBooksQueryResultCheck > 0) {
				while ($row = mysqli_fetch_array($allBooksQueryResult, MYSQLI_ASSOC)){
					array_push($books, $row);					
				}
			}
	
			if($allAuthorsQueryResultCheck > 0) {
				while ($row = mysqli_fetch_array($allAuthorsQueryResult, MYSQLI_ASSOC)){
					array_push($authors, $row);					
				}
			}
	
			return array("books" => $books, "authors" => $authors);		
		}

		if(isset($_POST["fetch"])) { # READ			
			$allData = getAllData($connect);		
			
			$response = array("data" => $allData);
			echo json_encode($response);
			exit("");
		} else if (isset($_POST["create"])) { # CREATE
			if($_POST["isBook"] == "true"){
				$addNewBookQuery = "INSERT INTO book (id, title, genre, author_id) VALUES ('$_POST[bookNum]', '$_POST[title]', '$_POST[genre]', '$_POST[authorNumRef]')";
				if(mysqli_query($connect, $addNewBookQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Book successfully added.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to add book.");
					echo json_encode($response);
					exit("");
				}
			} else {
				$addNewAuthorQuery = "INSERT INTO author (id, first_name, last_name) VALUES ('$_POST[authorNum]', '$_POST[fname]', '$_POST[lname]')";
				if(mysqli_query($connect, $addNewAuthorQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Author successfully added.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to add author.");
					echo json_encode($response);
					exit("");
				}
			}
		} else if (isset($_POST["update"])) { # UPDATE
			if($_POST["isBook"] == "true"){
				$updateBookQuery = "UPDATE book SET title='$_POST[title]', genre='$_POST[genre]', author_id='$_POST[authorNumRef]' WHERE id='$_POST[bookNumSelector]'";
				if(mysqli_query($connect, $updateBookQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Book successfully updated.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to update book.");
					echo json_encode($response);
					exit("");
				}
			} else {
				$updateBookQuery = "UPDATE author SET first_name='$_POST[fname]', last_name='$_POST[lname]' WHERE id='$_POST[authorNumSelector]'";
				if(mysqli_query($connect, $updateBookQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Author successfully updated.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to update author.");
					echo json_encode($response);
					exit("");
				}
			}
		} else if (isset($_POST["delete"])) { # DELETE
			if($_POST["isBook"] == "true"){
				$deleteBookQuery = "DELETE FROM book WHERE id='$_POST[bookNumSelector]'";
				if(mysqli_query($connect, $deleteBookQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Book successfully deleted.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to delete book.");
					echo json_encode($response);
					exit("");
				}
			} else {
				$deleteAuthorQuery = "DELETE FROM author WHERE id='$_POST[authorNumSelector]'";
				if(mysqli_query($connect, $deleteAuthorQuery)) {
					$allData = getAllData($connect);	

					$response = array("result" => "success", "data" => $allData, "message" => "Author successfully deleted.");
					echo json_encode($response);
					exit("");
				} else {
					$response = array("result" => "failure", "message" => "Failed to delete author.");
					echo json_encode($response);
					exit("");
				}
			}
		} 	
	}		
?>