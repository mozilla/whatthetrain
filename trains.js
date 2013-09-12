var URL = "http://people.mozilla.org/~tmielczarek/branch_versions.json";

function fetchData() {
  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    xdr.open("GET", URL);
    xdr.onload = function() {
      handleData(JSON.parse(xdr.responseText));
    };
    xdr.send();
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
  branch = branch[0].toUpperCase() + branch.slice(1);
  var h2 = document.createElement("h2");
  h2.id = branch;
  h2.className = "version";
  h2.textContent = "The current " + branch + " version is " + version;
  document.body.appendChild(h2);
}

document.addEventListener("DOMContentLoaded", fetchData, false);
