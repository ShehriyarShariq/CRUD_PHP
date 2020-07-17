let currentTabIndex = 0; // 0 - Book | 1 - Author
var data;
let booksMap = {},
  authorsMap = {};

// Init Loading
$("#authorForm").hide();
$("#loaded").hide();

loadAllDBData();

function loadAllDBData() {
  // Loads all books and authors from the database
  $.ajax({
    url: "includes/crud.php",
    type: "POST",
    data: { fetch: true },
    dataType: "JSON",
    success: (response) => {
      window.data = response.data;
      setTimeout(function () {
        afterDBLoad();
      }, 1000);
    },
    error: (xhr, status, errorThrown) => {
      console.log(xhr.responseText);
    },
  });
}

function CRUD_Operation(data, type, isBook) {
  // For Create/Updated/Delete and Read
  data.push({ name: type, value: true }); // Type of Request
  data.push({ name: "isBook", value: isBook });

  $.ajax({
    url: "includes/crud.php",
    type: "POST",
    data: data,
    dataType: "JSON",
    success: (response) => {
      $("#status").text(response.message);
      if (response.result == "success") {
        window.data = response.data;

        updateData();
      } else {
        $("#status").css("color", $("#deleteBtn").css("background-color"));
      }
    },
    error: (xhr, status, errorThrown) => {
      console.log(xhr.responseText);
    },
  });
}

// Generate Alphanumeric String
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function afterDBLoad() {
  booksMap = {};
  authorsMap = {};

  // Assign respective ids to their respective data for faster lookup
  data.books.forEach((book) => {
    booksMap[book["id"]] = book;
  });
  data.authors.forEach((author) => {
    authorsMap[author["id"]] = author;
  });

  // Finish Loader
  $("#loader").hide();
  $("#loaded").show();

  // Init
  $("#deleteBtn").hide();

  $("#bookNum").val(makeid(6));
  $("#authorNum").val(makeid(6));

  $("#new").prop("checked", true);

  if (data.books.length == 0) {
    $("#existing").prop("disabled", true);
  }

  initTable(data.books, true);

  $("#submitBtn").css(
    "background-color",
    $("#selectBooksBtn").css("background-color")
  );

  let selectedOption = $('input[name="selector"]:checked').val();

  // To change between New and Exisitng
  $('input[name="selector"]').change(function () {
    selectedOption = $('input[name="selector"]:checked').val();

    if (selectedOption == "new") $("#deleteBtn").hide();
    else $("#deleteBtn").show();

    resetErrors();

    if (selectedOption == "new") {
      $("#bookNumSelector").hide();
      $("#bookNum").show();
      $("#authorNumSelector").hide();
      $("#authorNum").show();

      if (currentTabIndex == 0) {
        const firstBook = booksMap[Object.keys(booksMap)[0]];
        $("input[name='title']").prop("disabled", false);
        $("input[name='genre']").prop("disabled", false);
        $("#authorNumRef").prop("disabled", false);

        $("input[name='title']").val("");
        $("input[name='genre']").val("");

        $("#submitBtn").text("Add Book");
      } else {
        $("input[name='fname']").prop("disabled", false);
        $("input[name='lname']").prop("disabled", false);

        $("input[name='fname']").val("");
        $("input[name='lname']").val("");

        $("#submitBtn").text("Add Author");
      }
    } else {
      $("#bookNum").hide();
      $("#bookNumSelector").show();
      $("#authorNum").hide();
      $("#authorNumSelector").show();

      $("#bookNumSelector > option:first-child")
        .prop("selected", true)
        .change();
      $("#authorNumSelector > option:first-child")
        .prop("selected", true)
        .change();

      // Disable fields
      if (currentTabIndex == 0) {
        $("input[name='title']").val("");
        $("input[name='genre']").val("");
        $("#authorNumRef > option:first-child").prop("selected", true);
        $("input[name='title']").prop("disabled", true);
        $("input[name='genre']").prop("disabled", true);
        $("#authorNumRef").prop("disabled", true);

        $("#submitBtn").text("Edit Book");
      } else {
        $("input[name='fname']").val("");
        $("input[name='lname']").val("");
        $("input[name='fname']").prop("disabled", true);
        $("input[name='lname']").prop("disabled", true);

        $("#submitBtn").text("Edit Author");
      }
    }
  });

  // Init Selectors
  $("#bookNumSelector").html("");
  $("#bookNumSelector").append(
    "<option name='default' hidden disabled selected value> -- Select a Book -- </option>"
  );
  for (let i = 0; i < data.books.length; i++) {
    $("#bookNumSelector").append(
      "<option value=" +
        data.books[i]["id"] +
        ">" +
        data.books[i]["id"] +
        "</option>"
    );
  }

  $("#authorNumRef").html("");
  $("#authorNumSelector").html("");
  $("#authorNumRef").append(
    "<option name='default' hidden disabled selected value> -- Select an Author -- </option>"
  );
  $("#authorNumSelector").append(
    "<option name='default' hidden disabled selected value> -- Select an Author -- </option>"
  );
  for (let i = 0; i < data.authors.length; i++) {
    const authorName =
      data.authors[i]["first_name"] +
      " " +
      data.authors[i]["last_name"] +
      " [" +
      data.authors[i]["id"] +
      "]";

    $("#authorNumRef").append(
      "<option value=" + data.authors[i]["id"] + ">" + authorName + "</option>"
    );

    $("#authorNumSelector").append(
      "<option value=" + data.authors[i]["id"] + ">" + authorName + "</option>"
    );
  }

  // In Edit Book View, listener for when option changed
  $("#bookNumSelector").change(() => {
    const selectedID = $("#bookNumSelector").val();

    if (selectedID != null) {
      const selectedBook = booksMap[selectedID];

      $("input[name='title']").prop("disabled", false);
      $("input[name='genre']").prop("disabled", false);
      $("#authorNumRef").prop("disabled", false);

      $("input[name='title']").val(selectedBook.title);
      $("input[name='genre']").val(selectedBook.genre);
      $("option[value=" + selectedBook.author_id + "]").prop("selected", true);
    } else {
      $("input[name='title']").val("");
      $("input[name='genre']").val("");
      $("#authorNumRef > option:first-child").prop("selected", true);

      if (selectedOption == "existing") {
        $("input[name='title']").prop("disabled", true);
        $("input[name='genre']").prop("disabled", true);
        $("#authorNumRef").prop("disabled", true);
      }
    }
  });

  // In Edit Author View, listener for when option changed
  $("#authorNumSelector").change((e) => {
    const selectedID = $("#authorNumSelector").val();

    if (selectedID != null) {
      const selectedAuthor = authorsMap[selectedID];

      $("input[name='fname']").prop("disabled", false);
      $("input[name='lname']").prop("disabled", false);

      $("input[name='fname']").val(selectedAuthor.first_name);
      $("input[name='lname']").val(selectedAuthor.last_name);
    } else {
      $("input[name='fname']").val("");
      $("input[name='lname']").val("");

      if (selectedOption == "existing") {
        $("input[name='fname']").prop("disabled", true);
        $("input[name='lname']").prop("disabled", true);
      }
    }
  });

  // Select book tab
  $("#selectBooksBtn").click(function (e) {
    if (currentTabIndex != 0) {
      currentTabIndex = 0;
      $("#formContainer > h1").text("Book");

      $("#bookNum").val(makeid(6));

      $("#labelNew").text("Add New Book");
      $("#labelExisting").text("Edit/Delete Existing Book");

      if (data.books.length == 0)
        $("#new").attr("checked", true).trigger("click");

      if (selectedOption == "new") {
        $("#submitBtn").text("Add Book");

        $("input[name='title']").prop("disabled", false);
        $("input[name='genre']").prop("disabled", false);
        $("#authorNumRef").prop("disabled", false);

        $("input[name='title']").val("");
        $("input[name='genre']").val("");
      } else {
        $("#submitBtn").text("Edit Book");

        $("#bookNumSelector > option:first-child")
          .prop("selected", true)
          .change();
      }

      $("#existing").prop("disabled", data.books.length == 0);

      resetErrors();

      $("#submitBtn").css(
        "background-color",
        $("#selectBooksBtn").css("background-color")
      );

      $("#authorForm").hide();
      $("#bookForm").show();

      initTable(data.books, true);
    }
  });

  // Select author tab
  $("#selectAuthorsBtn").click(function (e) {
    if (currentTabIndex != 1) {
      currentTabIndex = 1;
      $("#formContainer > h1").text("Author");

      $("#authorNum").val(makeid(6));

      $("#labelNew").text("Add New Author");
      $("#labelExisting").text("Edit/Delete Existing Author");

      if (selectedOption == "new") {
        $("#submitBtn").text("Add Author");

        $("input[name='fname']").prop("disabled", false);
        $("input[name='lname']").prop("disabled", false);

        $("input[name='fname']").val("");
        $("input[name='lname']").val("");
      } else {
        $("#submitBtn").text("Edit Author");
        $("#authorNumSelector > option:first-child")
          .prop("selected", true)
          .change();
      }

      $("#existing").prop("disabled", data.authors.length == 0);

      resetErrors();

      $("#submitBtn").css(
        "background-color",
        $("#selectAuthorsBtn").css("background-color")
      );

      $("th").css(
        "background-color",
        $("#selectAuthorsBtn").css("background-color")
      );

      $("#bookForm").hide();
      $("#authorForm").show();

      initTable(data.authors, false);
    }
  });

  $("#submitBtn").click((e) => {
    if (validate(selectedOption)) {
      if (currentTabIndex == 0) {
        let formData = $("#bookForm").serializeArray();
        if (selectedOption == "new") {
          $("#bookNum").val(makeid(6));
          $("input[name='title']").val("");
          $("input[name='genre']").val("");

          CRUD_Operation(formData, "create", true);
        } else {
          $("#bookNumSelector > option:first-child")
            .prop("selected", true)
            .change();

          CRUD_Operation(formData, "update", true);
        }
      } else {
        let formData = $("#authorForm").serializeArray();
        if (selectedOption == "new") {
          $("#authorNum").val(makeid(6));
          $("input[name='fname']").val("");
          $("input[name='lname']").val("");

          CRUD_Operation(formData, "create", false);
        } else {
          $("#authorNumSelector > option:first-child")
            .prop("selected", true)
            .change();

          CRUD_Operation(formData, "update", false);
        }
      }
    }
  });

  $("#deleteBtn").click(() => {
    if (currentTabIndex == 0) {
      let formData = $("#bookForm").serializeArray();

      $("input[name='title']").val("");
      $("input[name='genre']").val("");

      CRUD_Operation(formData, "delete", true);
    } else {
      let formData = $("#authorForm").serializeArray();

      $("input[name='fname']").val("");
      $("input[name='lname']").val("");

      CRUD_Operation(formData, "delete", false);
    }
  });

  $("#clearBtn").click(() => {
    resetErrors();
    if (currentTabIndex == 0) {
      $("input[name='title']").val("");
      $("input[name='genre']").val("");

      $("#bookNumSelector > option:first-child")
        .prop("selected", true)
        .change();
    } else {
      $("input[name='fname']").val("");
      $("input[name='lname']").val("");

      $("#authorNumSelector > option:first-child")
        .prop("selected", true)
        .change();
    }
  });
}

// Called after db operation updates
function updateData() {
  booksMap = {};
  authorsMap = {};
  data.books.forEach((book) => {
    booksMap[book["id"]] = book;
  });
  data.authors.forEach((author) => {
    authorsMap[author["id"]] = author;
  });

  $("#status").css("opacity", 1);

  $("#bookNumSelector > option:first-child").prop("selected", true).change();
  $("#authorNumSelector > option:first-child").prop("selected", true).change();

  if (currentTabIndex == 0) {
    $("#existing").prop("disabled", data.books.length == 0);
    if (data.books.length == 0)
      $("#new").attr("checked", true).trigger("click");
    initTable(data.books, true);

    $("#status").css("color", $("#selectBooksBtn").css("background-color"));
  } else {
    $("#existing").prop("disabled", data.authors.length == 0);
    if (data.authors.length == 0)
      $("#new").attr("checked", true).trigger("click");
    initTable(data.authors, false);

    $("#status").css("color", $("#selectAuthorsBtn").css("background-color"));
  }

  $("#bookNumSelector").html("");
  $("#bookNumSelector").append(
    "<option name='default' hidden disabled selected value> -- Select a Book -- </option>"
  );
  for (let i = 0; i < data.books.length; i++) {
    $("#bookNumSelector").append(
      "<option value=" +
        data.books[i]["id"] +
        ">" +
        data.books[i]["id"] +
        "</option>"
    );
  }

  $("#authorNumRef").html("");
  $("#authorNumSelector").html("");
  $("#authorNumRef").append(
    "<option name='default' hidden disabled selected value> -- Select an Author -- </option>"
  );
  $("#authorNumSelector").append(
    "<option name='default' hidden disabled selected value> -- Select an Author -- </option>"
  );
  for (let i = 0; i < data.authors.length; i++) {
    const authorName =
      data.authors[i]["first_name"] +
      " " +
      data.authors[i]["last_name"] +
      " [" +
      data.authors[i]["id"] +
      "]";

    $("#authorNumRef").append(
      "<option value=" + data.authors[i]["id"] + ">" + authorName + "</option>"
    );

    $("#authorNumSelector").append(
      "<option value=" + data.authors[i]["id"] + ">" + authorName + "</option>"
    );
  }
}

function initTable(rows, isBooks) {
  if (rows.length > 0) {
    $("#zeroRecords").hide();
    $("#notZeroRecords").show();

    $("#recordsTable").html("");

    if (isBooks) {
      $("#recordsTable").append(
        "<tr><th>Book No.</th><th>Title</th><th>Genre</th><th>Author No.</th></tr>"
      );

      $("th").css(
        "background-color",
        $("#selectBooksBtn").css("background-color")
      );

      rows.forEach((row) => {
        $("#recordsTable").append(
          "<tr><td>" +
            row["id"] +
            "</td><td>" +
            row["title"] +
            "</td><td>" +
            row["genre"] +
            "</td><td>" +
            row["author_id"] +
            "</td></tr>"
        );
      });
    } else {
      $("#recordsTable").append(
        "<tr><th>Author No.</th><th>First Name</th><th>Last Name</th></tr>"
      );

      $("th").css(
        "background-color",
        $("#selectAuthorsBtn").css("background-color")
      );

      rows.forEach((row) => {
        $("#recordsTable").append(
          "<tr><td>" +
            row["id"] +
            "</td><td>" +
            row["first_name"] +
            "</td><td>" +
            row["last_name"] +
            "</td></tr>"
        );
      });
    }
  } else {
    $("#notZeroRecords").hide();
    $("#zeroRecords").show();
  }
}

function validate(selectedOption) {
  let isValid = true;

  // Input Field Validation
  if (currentTabIndex == 0) {
    // Book Tab
    $("#bookForm input[type='text']:not(input[name='bookNum'])").each(
      (i, inp) => {
        if ($(inp).val().length == 0) {
          isValid = false;

          if (selectedOption == "existing") {
            if (
              $("#bookNumSelector").children("option:selected").attr("name") !=
              "default"
            ) {
              $("#" + inp.getAttribute("name") + "Error").css("opacity", 1);
            }
          } else {
            $("#" + inp.getAttribute("name") + "Error").css("opacity", 1);
          }
        } else {
          $("#" + inp.getAttribute("name") + "Error").css("opacity", 0);
        }
      }
    );
  } else {
    // Author Tab
    $("#authorForm input[type='text']:not(input[name='authorNum'])").each(
      (i, inp) => {
        if ($(inp).val().length == 0) {
          isValid = false;

          if (selectedOption == "existing") {
            if (
              $("#authorNumSelector")
                .children("option:selected")
                .attr("name") != "default"
            ) {
              $("#" + inp.getAttribute("name") + "Error").css("opacity", 1);
            }
          } else {
            $("#" + inp.getAttribute("name") + "Error").css("opacity", 1);
          }
        } else {
          $("#" + inp.getAttribute("name") + "Error").css("opacity", 0);
        }
      }
    );
  }

  // Selector validation
  if (currentTabIndex == 0) {
    // Book Tab
    $("#bookNumSelector, #authorNumRef").each((i, select) => {
      if ($(select).children("option:selected").attr("name") == "default") {
        let selectName = select.getAttribute("name");
        if (selectName.includes("Selector")) {
          if (selectedOption == "existing") {
            isValid = false;
            $("#" + select.getAttribute("name") + "Error").css("opacity", 1);
          }
        } else {
          isValid = false;
          if (selectedOption == "existing") {
            if (
              $("#bookNumSelector").children("option:selected").attr("name") !=
              "default"
            ) {
              $("#" + select.getAttribute("name") + "Error").css("opacity", 1);
            }
          } else {
            $("#" + select.getAttribute("name") + "Error").css("opacity", 1);
          }
        }
      } else {
        $("#" + select.getAttribute("name") + "Error").css("opacity", 0);
      }
    });
  } else {
    // Author Tab
    $("#authorNumSelector").each((i, select) => {
      if ($(select).children("option:selected").attr("name") == "default") {
        let selectName = select.getAttribute("name");

        if (selectedOption == "existing") {
          isValid = false;
          $("#" + select.getAttribute("name") + "Error").css("opacity", 1);
        }
      } else {
        $("#" + select.getAttribute("name") + "Error").css("opacity", 0);
      }
    });
  }

  return isValid;
}

function resetErrors() {
  // Reset all error messages
  $("#status").css("opacity", 0);

  $(
    "input[type='text']:not(input[name='bookNum'], input[name='authorNum'])"
  ).each((i, inp) => {
    $("#" + inp.getAttribute("name") + "Error").css("opacity", 0);
  });

  $("#bookNumSelector, #authorNumRef, #authorNumSelector").each((i, select) => {
    $("#" + select.getAttribute("name") + "Error").css("opacity", 0);
  });
}
