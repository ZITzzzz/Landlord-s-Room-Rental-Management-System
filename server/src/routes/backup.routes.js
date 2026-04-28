const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');
const multer = require('multer');
const adminKey = require('../middlewares/adminKey');

const upload = multer({ dest: os.tmpdir() });

// Parse mongo URI into host/port/db
const parseMongoURI = (uri) => {
  try {
    const url = new URL(uri);
    return {
      host: url.hostname || 'localhost',
      port: url.port || '27017',
      db: url.pathname.replace(/^\//, '') || 'test',
      username: url.username || '',
      password: url.password || '',
    };
  } catch {
    return { host: 'localhost', port: '27017', db: 'test', username: '', password: '' };
  }
};

// GET /api/backup — dump MongoDB and stream as tar.gz
router.get('/', adminKey, (req, res, next) => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/room_rental';
  const { host, port, db, username, password } = parseMongoURI(uri);
  const dumpDir = path.join(os.tmpdir(), `dump_${Date.now()}`);
  const tarFile = `${dumpDir}.tar.gz`;

  let authArgs = `--host ${host} --port ${port} --db ${db}`;
  if (username) authArgs += ` --username ${username} --password ${password} --authenticationDatabase admin`;

  const dumpCmd = `mongodump ${authArgs} --out "${dumpDir}"`;
  const tarCmd = `tar -czf "${tarFile}" -C "${path.dirname(dumpDir)}" "${path.basename(dumpDir)}"`;

  exec(dumpCmd, (err) => {
    if (err) {
      fs.rm(dumpDir, { recursive: true, force: true }, () => {});
      return next(Object.assign(new Error('mongodump thất bại: ' + err.message), { status: 500 }));
    }
    exec(tarCmd, (err2) => {
      fs.rm(dumpDir, { recursive: true, force: true }, () => {});
      if (err2) {
        return next(Object.assign(new Error('Nén backup thất bại: ' + err2.message), { status: 500 }));
      }
      const filename = `backup_${db}_${new Date().toISOString().slice(0, 10)}.tar.gz`;
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const stream = fs.createReadStream(tarFile);
      stream.pipe(res);
      stream.on('end', () => fs.rm(tarFile, { force: true }, () => {}));
      stream.on('error', (e) => {
        fs.rm(tarFile, { force: true }, () => {});
        next(e);
      });
    });
  });
});

// POST /api/restore — receive tar.gz, run mongorestore
router.post('/', adminKey, upload.single('backup'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Vui lòng upload file backup (.tar.gz)' });
  }

  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/room_rental';
  const { host, port, db, username, password } = parseMongoURI(uri);
  const extractDir = path.join(os.tmpdir(), `restore_${Date.now()}`);
  const tarFile = req.file.path;

  const extractCmd = `tar -xzf "${tarFile}" -C "${os.tmpdir()}" --one-top-level="${path.basename(extractDir)}"`;

  exec(`mkdir -p "${extractDir}" && ${extractCmd}`, (err) => {
    if (err) {
      fs.rm(tarFile, { force: true }, () => {});
      fs.rm(extractDir, { recursive: true, force: true }, () => {});
      return next(Object.assign(new Error('Giải nén thất bại: ' + err.message), { status: 500 }));
    }

    let authArgs = `--host ${host} --port ${port} --db ${db}`;
    if (username) authArgs += ` --username ${username} --password ${password} --authenticationDatabase admin`;

    const restoreCmd = `mongorestore ${authArgs} --drop "${extractDir}"`;

    exec(restoreCmd, (err2) => {
      fs.rm(tarFile, { force: true }, () => {});
      fs.rm(extractDir, { recursive: true, force: true }, () => {});
      if (err2) {
        return next(Object.assign(new Error('mongorestore thất bại: ' + err2.message), { status: 500 }));
      }
      res.json({ success: true, data: { message: 'Restore thành công' } });
    });
  });
});

module.exports = router;
