var URL = "http://thinkingalaud.com/api/admin/";

function ajax(method, url, callback) {
  console.log(url);
  var xhttp = new XMLHttpRequest();
  xhttp.open(method, url, true);
  xhttp.addEventListener("load", function (result) {
    console.log(result.target.response);
    var response = JSON.parse(result.target.response);
    callback(response);
  });
  xhttp.send();
}

function submitVisitChange(table) {
  var button = document.getElementById("button-" + table);
  var pressed = button.style.borderStyle === "inset";
  ajax("POST", URL + "visit/" + table + "?visit=" + (pressed ? "false" : "true"), function(response) {
    button.style.borderStyle = pressed ? "solid" : "inset";
  });
}

function main() {
  // Populate visit buttons
  ajax("GET", URL + "visited", function (response) {
    var visitedElement = document.getElementById("visited");
    var currentElement = null;
    for(var i = 0; i < response.length; i++) {
      var table = response[i][0];
      var visited = response[i][1];
      var button = document.createElement("input");
      button.id = "button-" + table;
      button.type = "button";
      button.value = table;
      button.style.borderStyle = visited ? "inset" : "solid";
      button.style.margin = '1em';
      button.style.height = '4em';
      button.style.width = '4em';
      button.onclick = function() {
        submitVisitChange(this.value);
      }
      if (i % 5 == 0) {
        currentElement = document.createElement("div");
        visitedElement.appendChild(currentElement);
      }
      currentElement.appendChild(button);
    }
  });

  // Populate current state
  ajax("GET", URL + "state", function (response) {
    var stateElement = document.getElementById("state");
    for(var i = 0; i < response.length; i++) {
      var table = response[i][0];
      var user_id = response[i][1];
      var stage = response[i][2];
      var tableElement = document.createElement("div");
      tableElement.innerHTML = "Table " + table + "|" + user_id + ": Stage " + stage;
      stateElement.appendChild(tableElement);
    }
  });
}

main();

