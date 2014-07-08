var URL = ["http://hg.mozilla.org/", "/raw-file/tip/config/milestone.txt"];
var BRANCHES = [
  ["release", "releases/mozilla-release"],
  ["beta", "releases/mozilla-beta"],
  ["aurora", "releases/mozilla-aurora"],
  ["nightly", "mozilla-central"]
];

var versions = {};

function getVersion(responseText) {
  var bits = responseText.split("\n").reverse();
  var v = bits.filter(function(x) {
    return x != '';
  })[0];
  return v.replace(/[ab]\d+$/, '');
}

function fetchData(branch, repo) {
  var url = URL[0] + repo + URL[1];
  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    xdr.open("GET", url);
    xdr.onload = function() {
      appendVersionInfo(branch, getVersion(xdr.responseText));
    };
    xdr.send();
  }
  else {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev) {
      if (req.readyState == 4 && req.status == 200) {
        appendVersionInfo(branch, getVersion(req.responseText));
      }
    };
    req.open("GET", url, true);
    req.send(null);
  }
}

function appendVersionInfo(branch, version, h2) {
  versions[branch] = version;
  h2 = h2 || document.getElementById(branch);
  if (!h2)
    return;
  branch = branch[0].toUpperCase() + branch.slice(1);
  h2.textContent = "The current " + branch + " version is " + version;
}

function makeHeader(branch) {
  var h2 = document.createElement("h2");
  h2.id = branch;
  h2.className = "version";
  if (branch in versions) {
    appendVersionInfo(branch, versions[branch], h2);
  }
  document.body.appendChild(h2);
}

function calculateNextUplift() {
  // This is where the release calendar (ICS) starts:
  // https://mail.mozilla.com/home/publiccalendar@mozilla.com/Releases%20Scheduling.html?view=month&action=view&invId=41c66ea8-7d47-4eb5-9a41-252e092ddbe9%3a16570-803759&pstat=AC&instStartTime=1405897200000&instDuration=86400000&useInstance=0
  var d = new Date("2014-02-03T17:00:00.000Z");
  var now = new Date();
  while (d.getTime() < now.getTime()) {
    d.setDate(d.getDate() + 6*7);
  }
  return d.toDateString();
}

function init() {
  for (var i = 0; i < BRANCHES.length; i++) {
    var branch = BRANCHES[i];
    makeHeader(branch[0]);
  }
  var h3 = document.createElement("h3");
  h3.id = "uplift";
  h3.textContent = "The next uplift is " + calculateNextUplift();
  document.body.appendChild(h3);
}

document.addEventListener("DOMContentLoaded", init, false);
// Start requests before the page finishes loading.
for (var i = 0; i < BRANCHES.length; i++) {
  var branch = BRANCHES[i];
  fetchData(branch[0], branch[1]);
}
