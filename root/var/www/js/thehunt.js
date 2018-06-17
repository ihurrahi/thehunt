var URL = "http://thinkingalaud.com/api/";

function setToaster(value) {
  var toaster = document.getElementById("toaster");
  var toast = `
  <div>
    ${value}
    <span onClick="hideToaster()">x</span>
  <div>
`;
  toaster.innerHTML = toast;
}

function hideToaster() {
  var toaster = document.getElementById("toaster");
  toaster.innerHTML = '';
}

function ajax(method, url, callback) {
  console.log(url);
  var xhttp = new XMLHttpRequest();
  xhttp.open(method, url, true);
  xhttp.addEventListener("load", function (result) {
    console.log(result.target.response);
    if (this.status === 404) {
      setToaster(result.target.response);
    } else {
      var response = JSON.parse(result.target.response);
      if (response['message']) {
        setToaster(response['message']);
      }
      callback(response);
    }
  });
  xhttp.send();
}

// Server requests
function getCurrentStage(table, callback) {
  var url = URL + "table/" + table
  ajax("GET", url, callback);
}

function getNotifications() {
  return;
}

function submit(stage) {
  var elements = document.getElementById("form").children;
  var values = [];
  for(var i = 0; i < elements.length; i++){
    var item = elements.item(i);
    if (item.type !== 'button') {
      values.push(item.name + "=" + item.value);
    }
  }
  var url = URL + "stage/" + stage + "?" + values.join('&');
  ajax("GET", url, function (response) {
    
  });
}

// Helpers
function getTableFromCookie() {
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].split('=');
    if (cookie[0].trim() === 'table') {
      return parseInt(cookie[1]);
    }
  }
  return null;
}

function clearContent() {
  var content = document.getElementById("content");
  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }
}

function submitTable() {
  var table = document.getElementById("form_table").value;
  getCurrentStage(table, function (response) {
    document.cookie = `table=${table}`;
    setStage(table, response['stage']);
  });
}

function setHeader(table) {
  var header = '';
  if (table) {
    header = `
  <h2>Playing as Table ${table}</h2>
    `;
  } else {
    header = `
  <h2>Welcome to the The Hunt!</h2>
    `;
  }
  var headerElement = document.getElementById("header");
  headerElement.innerHTML = header;
}

function setContent(content) {
  var contentElement = document.getElementById("content");
  contentElement.innerHTML = content;
}

// Stages
function setStageZero() {
  var page = `
<div>
  <p>What table are you at?</p>
  <div id="form">
    <input type="text" id="form_table" name="table">
    <input type="button" value="Submit" onClick="submitTable()">
  </div>
</div>
`;
  setContent(page);
}

function setStageOne() {
  var table = getTableFromCookie();
  var page = `
<div>
  <div id="form">
    <input type="text" id="stageOne" name="answer">
    <input type="hidden" id="table" value=${table} name="table">
    <input type="button" value="Submit" onClick="submit(1)">
  </div>
</div>
  `;
  setContent(page);
}

function setStage(table, stage) {
  clearContent();
  setHeader(table);
  if (stage === 0) {
    setStageZero();
  } else if (stage === 1) {
    setStageOne();
  }
}

// Main
function main() {
  var table = getTableFromCookie();
  if (table) {
    getCurrentStage(table, function (response) {
      setStage(table, response['stage']);
    });
  } else {
    setStage(null, 0);
  }
}

main();
