// Saves the app data on this PC (plain files, no browser storage).
const fs = require('fs'), path = require('path');
function createStore(root) {
  const dataFile = path.join(root, 'smv_master_db.json');
  const copies = path.join(root, 'daily-copies');
  const cfgFile = path.join(root, 'config.json');
  const ensure = d => fs.mkdirSync(d, { recursive: true });
  const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const count = o => { try { return Object.entries((o && o.c) || {}).reduce((s, [k, v]) => s + (k === 'settings' ? 0 : Object.keys(v || {}).length), 0); } catch (e) { return 0; } };
  const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
  function atomicWrite(file, text) { ensure(path.dirname(file)); const tmp = file + '.tmp'; fs.writeFileSync(tmp, text, 'utf8'); fs.renameSync(tmp, file); }
  function cfg() { return readJson(cfgFile) || {}; }
  return {
    root, dataFile, count,
    load() { try { return fs.readFileSync(dataFile, 'utf8'); } catch (e) { return null; } },
    save(text) {
      atomicWrite(dataFile, text);
      try {                                   // one safety copy per day, last 30 days kept
        const f = path.join(copies, 'smv_' + today() + '.json');
        const old = readJson(f);
        if (!old || count(old) <= count(JSON.parse(text))) atomicWrite(f, text);
        const all = fs.readdirSync(copies).filter(n => /^smv_.*\.json$/.test(n)).sort();
        all.slice(0, Math.max(0, all.length - 30)).forEach(n => fs.unlinkSync(path.join(copies, n)));
      } catch (e) {}
      return true;
    },
    getFolder() { const f = cfg().backup; return f && fs.existsSync(f) ? f : null; },
    setFolder(f) { const c = cfg(); if (f) c.backup = f; else delete c.backup; atomicWrite(cfgFile, JSON.stringify(c)); return f || null; },
    autoBackup(name, text) {                  // never replaces a file that holds more data
      const folder = this.getFolder(); if (!folder) return null;
      let target = path.join(folder, name);
      const old = readJson(target);
      if (old && count(old) > count(JSON.parse(text))) {
        const d = new Date(), hm = String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0');
        target = path.join(folder, name.replace(/\.json$/, '') + '_' + hm + '.json');
      }
      atomicWrite(target, text); return target;
    }
  };
}
module.exports = { createStore };
