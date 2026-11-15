// uig.me home: the "last hour" feed and one live number per work tile, from the honeypot's recent.json and
// stats.json, detections.uig.me/summary.json and guide.uig.me/summary.json. Anything that fails to load is
// left out; the page reads fine without it. Strings from the data are attacker-controlled: they are only
// ever set with textContent.
"use strict";

(function () {
  const local = new URLSearchParams(location.search).get("local"); // ?local=1 reads fixtures from data/
  const HP = local ? "data/" : "https://raw.githubusercontent.com/estul-lachin/uig-honeypot-data/main/";
  const DET = local ? "data/detections.json" : "https://detections.uig.me/summary.json";
  const GUIDE = local ? "data/guide.json" : "https://guide.uig.me/summary.json";
  const FEED_ROWS = 4;
  const fmt = new Intl.NumberFormat("en");
  const $ = (id) => document.getElementById(id);
  const get = (url) => fetch(url, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(url + ": " + r.status);
    return r.json();
  });
  const warn = (e) => console.warn(e);
  const day = (d) => new Date(d + "T00:00:00Z").toLocaleDateString("en", { month: "short", day: "numeric", timeZone: "UTC" });
  const isDay = (d) => /^\d{4}-\d{2}-\d{2}$/.test(d || "");
  const region = (() => {
    try { const n = new Intl.DisplayNames(["en"], { type: "region" }); return (cc) => n.of(cc); }
    catch (e) { return (cc) => cc; }
  })();
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

  function place(e) {
    if (!e.cc) return "An unknown source";
    let name = e.cc;
    try { name = region(e.cc) || e.cc; } catch (err) { /* not a region code */ }
    return e.city ? e.city + ", " + e.cc : name;
  }

  // one plain sentence per event
  function sentence(e) {
    const text = clip(String(e.text || "").replace(/\s+/g, " ").trim(), 60);
    if (e.kind === "connect") return place(e) + " connects on " + (e.proto === "telnet" ? "Telnet" : "SSH");
    if (e.kind === "login") return place(e) + (e.ok ? " logs in as " : " tries ") + text + (e.ok ? "" : ", refused");
    if (e.kind === "command") return place(e) + " runs: " + text;
    return place(e) + ": " + (text || String(e.kind || "event"));
  }

  get(HP + "recent.json").then((r) => {
    const evs = (r.events || []).filter((e) => e && Number.isFinite(e.t)).sort((a, b) => b.t - a.t);
    if (!evs.length) return;
    const feed = $("feed");
    for (const e of evs.slice(0, FEED_ROWS)) {
      const li = document.createElement("li");
      const t = document.createElement("time");
      const d = new Date(e.t * 1000);
      t.dateTime = d.toISOString();
      t.textContent = d.toISOString().slice(11, 16);
      const s = document.createElement("span");
      s.textContent = sentence(e);
      li.append(t, s);
      feed.appendChild(li);
    }
    $("feed-note").textContent = fmt.format(evs.length) + " events in the last hour (times in UTC), published without IP addresses.";
    $("live").hidden = false;
  }).catch(warn);

  get(HP + "stats.json").then((s) => {
    $("hp-sessions").textContent = fmt.format(s.totals.sessions || 0) + " attack sessions"
      + (isDay(s.first_day) ? " since " + day(s.first_day) : "");
    if (s.generated_at) {
      $("updated").textContent = "Honeypot numbers as of " + s.generated_at.replace("T", " ").replace("Z", " UTC");
    }
  }).catch(warn);

  get(DET).then((s) => {
    if (s.rules) $("det-rules").textContent = fmt.format(s.rules);
    const so = s.soar;
    if (so && so.incidents > 0) {
      $("det-incidents").textContent = fmt.format(so.incidents) + " incidents auto-enriched"
        + (isDay(so.since) ? " since " + day(so.since) : "");
    } else if (s.rules) {
      $("det-incidents").textContent = fmt.format(s.rules) + " rules tested in CI";
    }
  }).catch(warn);

  get(GUIDE).then((s) => {
    if (s.playbooks) $("guide-playbooks").textContent = fmt.format(s.playbooks) + " playbooks cross-checked";
  }).catch(warn);
})();
