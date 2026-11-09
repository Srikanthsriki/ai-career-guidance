const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(__dirname);

// Approved Collections
const COLLECTIONS = ['profiles', 'recommendations', 'resumes', 'interviews', 'progress', 'knowledge', 'users'];

class FileDBEngine {
  constructor() {
    this.dir = DB_DIR;
    this.cache = new Map();
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dir)) {
      fs.mkdirSync(this.dir, { recursive: true });
    }

    for (const name of COLLECTIONS) {
      const filePath = path.join(this.dir, `${name}.json`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf-8');
        this.cache.set(name, []);
      } else {
        try {
          const raw = fs.readFileSync(filePath, 'utf-8');
          this.cache.set(name, JSON.parse(raw || '[]'));
        } catch (e) {
          console.warn(`[FileDB] Failed to parse ${name}.json, resetting to empty array.`);
          this.cache.set(name, []);
        }
      }
    }
    console.log(`[FileDB Engine] Initialized persistent database at: ${this.dir}`);
  }

  saveToDisk(collectionName) {
    try {
      const filePath = path.join(this.dir, `${collectionName}.json`);
      const data = this.cache.get(collectionName) || [];
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error(`[FileDB Error] Could not write ${collectionName}.json:`, err.message);
    }
  }

  generateId() {
    return 'doc_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  find(collectionName, filterFn = null) {
    const list = this.cache.get(collectionName) || [];
    if (!filterFn) return [...list];
    return list.filter(filterFn);
  }

  findById(collectionName, id) {
    const list = this.cache.get(collectionName) || [];
    return list.find(item => item._id === id || item.id === id) || null;
  }

  findOne(collectionName, filterFn) {
    const list = this.cache.get(collectionName) || [];
    return list.find(filterFn) || null;
  }

  insert(collectionName, doc) {
    const list = this.cache.get(collectionName) || [];
    const _id = doc._id || this.generateId();
    const newDoc = {
      ...doc,
      _id,
      createdAt: doc.createdAt || new Date(),
      updatedAt: new Date()
    };
    list.push(newDoc);
    this.cache.set(collectionName, list);
    this.saveToDisk(collectionName);
    return newDoc;
  }

  updateById(collectionName, id, updateData) {
    const list = this.cache.get(collectionName) || [];
    const index = list.findIndex(item => item._id === id || item.id === id);
    if (index === -1) return null;

    const existing = list[index];
    const updated = {
      ...existing,
      ...updateData,
      _id: existing._id,
      updatedAt: new Date()
    };
    list[index] = updated;
    this.cache.set(collectionName, list);
    this.saveToDisk(collectionName);
    return updated;
  }

  update(collectionName, id, updateData) {
    return this.updateById(collectionName, id, updateData);
  }

  upsert(collectionName, filterFn, docData) {
    const list = this.cache.get(collectionName) || [];
    const index = list.findIndex(filterFn);

    if (index !== -1) {
      const existing = list[index];
      const updated = {
        ...existing,
        ...docData,
        _id: existing._id,
        updatedAt: new Date()
      };
      list[index] = updated;
      this.cache.set(collectionName, list);
      this.saveToDisk(collectionName);
      return updated;
    } else {
      return this.insert(collectionName, docData);
    }
  }

  remove(collectionName, id) {
    const list = this.cache.get(collectionName) || [];
    const filtered = list.filter(item => item._id !== id && item.id !== id);
    this.cache.set(collectionName, filtered);
    this.saveToDisk(collectionName);
    return filtered.length < list.length;
  }

  clear(collectionName) {
    this.cache.set(collectionName, []);
    this.saveToDisk(collectionName);
  }

  getStats() {
    const stats = {};
    let totalBytes = 0;
    let totalRecords = 0;

    for (const name of COLLECTIONS) {
      const list = this.cache.get(name) || [];
      const filePath = path.join(this.dir, `${name}.json`);
      let sizeBytes = 0;
      if (fs.existsSync(filePath)) {
        sizeBytes = fs.statSync(filePath).size;
      }
      stats[name] = {
        recordCount: list.length,
        fileSizeBytes: sizeBytes,
        filePath
      };
      totalBytes += sizeBytes;
      totalRecords += list.length;
    }

    return {
      engine: 'Custom Persistent FileDB (JSON NoSQL Document Engine)',
      databasePath: this.dir,
      totalCollections: COLLECTIONS.length,
      totalRecords,
      totalDiskBytes: totalBytes,
      collections: stats
    };
  }

  exportAll() {
    const backup = {};
    for (const name of COLLECTIONS) {
      backup[name] = this.cache.get(name) || [];
    }
    return {
      exportedAt: new Date().toISOString(),
      engine: 'Custom Persistent FileDB',
      data: backup
    };
  }
}

const db = new FileDBEngine();

module.exports = db;

