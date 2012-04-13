#!/usr/bin/env python
import sys, urllib, json, re, os.path

URL = "http://hg.mozilla.org/%s/raw-file/tip/config/milestone.txt"
BRANCHES = {"nightly": "mozilla-central",
            "aurora": "releases/mozilla-aurora",
            "beta": "releases/mozilla-beta",
            "release": "releases/mozilla-release"}

def write_json(j, f):
    """
    Horrible.
    """
    f.write("{")
    f.write(",".join('"%s":"%s"' % x for x in j.iteritems()))
    f.write("}")

def main(output):
    r = re.compile("[ab]\d+$")
    versions = {}
    for name, hg_branch in BRANCHES.iteritems():
        try:
            data = urllib.urlopen(URL % hg_branch).readlines()[-1].strip()
            versions[name] = r.sub("", data)
        except:
            pass
    write_json(versions, open(output, "w"))

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), "branch_versions.json"))

