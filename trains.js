/*global gapi,XDomainRequest */
var URL = ["//hg.mozilla.org/", "/raw-file/tip/config/milestone.txt"];
var BRANCHES = [
  ["release", "releases/mozilla-release"],
  ["beta", "releases/mozilla-beta"],
  ["developer", "releases/mozilla-aurora", "Developer Edition (Aurora)"],
  ["nightly", "mozilla-central"]
];
var RELEASE_CALENDAR = "mozilla.com_2d37383433353432352d3939@resource.calendar.google.com";

var versions = {};

function getVersion(responseText) {
  var bits = responseText.split("\n").reverse();
  var v = bits.filter(function(x) {
    return x != '';
  })[0];
  return v.replace(/[ab]\d+$/, '');
}

function fetchData(branch, repo, description) {
  var url = URL[0] + repo + URL[1];
  if (window.XDomainRequest) {
    var xdr = new XDomainRequest();
    xdr.open("GET", url);
    xdr.onload = function() {
      appendVersionInfo(branch, getVersion(xdr.responseText), description);
    };
    xdr.send();
  }
  else {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function(ev) {
      if (req.readyState == 4 && req.status == 200) {
        appendVersionInfo(branch, getVersion(req.responseText), description);
      }
    };
    req.open("GET", url, true);
    req.send(null);
  }
}

function appendVersionInfo(branch, version, description, h2) {
  versions[branch] = version;
  h2 = h2 || document.getElementById(branch);
  if (!h2)
    return;
  branch = description || branch[0].toUpperCase() + branch.slice(1);
  h2.textContent = "The current " + branch + " version is " + version;
}

function makeHeader(branch, description) {
  var h2 = document.createElement("h2");
  h2.id = branch;
  h2.className = "version";
  if (branch in versions) {
    appendVersionInfo(branch, versions[branch], description, h2);
  }
  document.body.appendChild(h2);
}

function init() {
  for (var i = 0; i < BRANCHES.length; i++) {
    var branch = BRANCHES[i];
    makeHeader(branch[0], branch[2]);
  }
}

function setNextUplift(date, link) {
  var h3 = document.createElement("h3");
  h3.id = "uplift";
  h3.textContent = "The next uplift is ";
  var a = document.createElement("a");
  a.textContent = date;
  a.href = link;
  h3.appendChild(a);
  document.body.appendChild(h3);
}

function loadCalendar() {
  var request = gapi.client.calendar.events.list({
    calendarId: RELEASE_CALENDAR,
    singleEvents: true,
    orderBy: "startTime",
    q: "MERGE"
    //"timeMin": "xxx"
  });
  request.execute(function (r) {
    var now = new Date();
    for (var i=0; i < r.items.length; i++) {
      var item = r.items[i];
      // This doesn't handle dateTime or timeZone, but these calendar
      // events are all just dates currently.
      var then = new Date(r.items[i].start.date);
      if (item.summary.substr(0, 6) == "MERGE:" &&
          now.getTime() < then.getTime()) {
        // TODO: could format the date better, also
        // would be nice to do relative dates like "today" or "tomorrow".
        setNextUplift(r.items[i].start.date, r.items[i].htmlLink);
        break;
      }
    }
  });
}

function gapi_init() {
   gapi.client.setApiKey("AIzaSyCfLN9nQUWw4_GM1BHAx2S-laAOvDwvMg4");
   gapi.client.load("calendar", "v3").then(loadCalendar);
}

document.addEventListener("DOMContentLoaded", init, false);
// Start requests before the page finishes loading.
for (var i = 0; i < BRANCHES.length; i++) {
  var branch = BRANCHES[i];
  fetchData(branch[0], branch[1], branch[2]);
}
