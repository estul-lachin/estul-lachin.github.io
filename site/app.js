// uig.me: one live number per project card, from detections.uig.me/summary.json, guide.uig.me/summary.json
// and the honeypot's stats.json. If a feed fails, that card's number is hidden; the page reads fine without it.
// Strings from the data are only ever set with textContent.
"use strict";

(function () {
  const params = new URLSearchParams(location.search);
  // ?local=1 reads fixtures from data/ for a local preview
  const HP = params.get("local") ? "data/stats.json"
    : "https://raw.githubusercontent.com/estul-lachin/uig-honeypot-data/main/stats.json";
  const DET = params.get("local") ? "data/detections.json" : "https://detections.uig.me/summary.json";
  const GUIDE = params.get("local") ? "data/guide.json" : "https://guide.uig.me/summary.json";
  const fmt = new Intl.NumberFormat("en");
  const $ = (id) => document.getElementById(id);
  const get = (url) => fetch(url, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(url + ": " + r.status);
    return r.json();
  });
  // hide the number row of the card that holds this element
  const fail = (id) => (e) => {
    console.warn(e);
    $(id).closest(".nums").hidden = true;
  };
  const since = (day) => new Date(day + "T00:00:00Z")
    .toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });

  get(HP).then((s) => {
    $("hp-sessions").textContent = fmt.format(s.totals.sessions || 0);
    if (/^\d{4}-\d{2}-\d{2}$/.test(s.first_day || "")) {
      $("hp-sessions-label").textContent = "attack sessions since " + since(s.first_day);
    }
    if (s.generated_at) {
      $("updated").textContent = "Honeypot numbers as of " + s.generated_at.replace("T", " ").replace("Z", " UTC");
    }
  }).catch(fail("hp-sessions"));

  // SOAR incidents when the detections build could read Sentinel (its tools/soar_stats.py), else the rule count
  get(DET).then((s) => {
    const so = s.soar;
    if (so && so.incidents > 0) {
      $("det-num").textContent = fmt.format(so.incidents);
      $("det-label").textContent = "incidents auto-enriched"
        + (/^\d{4}-\d{2}-\d{2}$/.test(so.since || "") ? " since " + since(so.since) : "");
    } else if (s.rules) {
      $("det-num").textContent = fmt.format(s.rules);
    } else {
      throw new Error("no numbers in " + DET);
    }
  }).catch(fail("det-num"));

  get(GUIDE).then((s) => {
    if (!s.playbooks) throw new Error("no playbooks in " + GUIDE);
    $("guide-playbooks").textContent = fmt.format(s.playbooks);
  }).catch(fail("guide-playbooks"));
})();
