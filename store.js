// Saves the app data on this PC (plain files, no browser storage).
// The data folder can be changed by the user; the choice is remembered in cfgFile (outside the data folder).
const fs = require('fs'), path = require('path');
function createStore(initialRoot, cfgFile) {
  let root = initialRoot;
  const legacyCfg = path.join(initialRoot, 'config.json');           // older versions kept the settings here
  const dataFile = () => path.join(root, 'smv_master_db.json');
  const copies = () => path.join(root, 'daily-copies');
  const ensure = d => fs.mkdirSync(d, { recursive: true });
  const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 10); };
  const count = o => { try { return Object.entries((o && o.c) || {}).reduce((s, [k, v]) => s + (k === 'settings' ? 0 : Object.keys(v || {}).length), 0); } catch (e) { return 0; } };
  const readJson = f => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
  function atomicWrite(file, text) { ensure(path.dirname(file)); const tmp = file + '.tmp'; fs.writeFileSync(tmp, text, 'utf8'); fs.renameSync(tmp, file); }
  function cfg() { const c = readJson(cfgFile) || {}; if (!c.backup) { const l = readJson(legacyCfg); if (l && l.backup) c.backup = l.backup; } return c; }
  const saveCfg = c => atomicWrite(cfgFile, JSON.stringify(c));
  return {
    count,
    get root() { return root; },
    get dataFile() { return dataFile(); },
    load() { try { return fs.readFileSync(dataFile(), 'utf8'); } catch (e) { return null; } },
    save(text) {
      atomicWrite(dataFile(), text);
      try {                                   // one safety copy per day, last 30 days kept
        const f = path.join(copies(), 'smv_' + today() + '.json');
        const old = readJson(f);
        if (!old || count(old) <= count(JSON.parse(text))) atomicWrite(f, text);
        const all = fs.readdirSync(copies()).filter(n => /^smv_.*\.json$/.test(n)).sort();
        all.slice(0, Math.max(0, all.length - 30)).forEach(n => fs.unlinkSync(path.join(copies(), n)));
      } catch (e) {}
      return true;
    },
    hasData(dir) { return fs.existsSync(path.join(dir, 'smv_master_db.json')); },
    setRoot(dir) {                            // switch to a folder chosen by the user
      ensure(dir);
      const target = path.join(dir, 'smv_master_db.json');
      if (!fs.existsSync(target)) { const cur = this.load(); if (cur) atomicWrite(target, cur); }   // keep what exists there, otherwise copy the current data
      root = dir; const c = cfg(); c.dataDir = dir; saveCfg(c); return dir;
    },
    getFolder() { const f = cfg().backup; return f && fs.existsSync(f) ? f : null; },
    setFolder(f) { const c = cfg(); if (f) c.backup = f; else delete c.backup; saveCfg(c); return f || null; },
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
