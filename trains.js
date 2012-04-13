var URL = "http://people.mozilla.com/~tmielczarek/branch_versions.json";

function fetchData() {
  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    xdr.open("GET", URL);
    xdr.onload = function() {
      handleData(JSON.parse(xdr.responseText));
    };
  }
  else {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev) {
      if (req.readyState == 4 && req.status == 200) {
        handleData(JSON.parse(req.responseText));
      }
    };
    req.open("GET", URL, true);
    req.send(null);  
  }

}

function handleData(data) {
  var branches = ["release", "beta", "aurora", "nightly"];
  for (var i = 0; i < branches.length; i++) {
    appendVersionInfo(branches[i], data[branches[i]]);
  }
}

function appendVersionInfo(branch, version) {
  var p = document.createElement("p");
  branch = branch[0].toUpperCase() + branch.slice(1);
  p.innerHTML = "<h2>The current " + branch + " version is " + version + "</h2>";
  document.body.appendChild(p);
}

document.addEventListener("DOMContentLoaded", fetchData, false);