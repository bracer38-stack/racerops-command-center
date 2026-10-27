import Database from 'better-sqlite3';
import { pathToFileURL } from 'node:url';

export function upgradePhaseOne(path) {
  const db = new Database(path, { fileMustExist: true });
  try {
    db.pragma('busy_timeout = 5000');
    const start = db.pragma('user_version', { simple: true });
    if (start !== 2 && start !== 1) throw new Error('Expected a version 1 or 2 RacerOps database. No changes made.');
    db.transaction(() => {
      const add = (table, column, sql) => {
        if (!db.pragma(`table_info(${table})`).some(field => field.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${sql}`);
      };
      if (start === 1) {
        add('inventory', 'imageUrl', "TEXT NOT NULL DEFAULT ''");
        add('webhook_events', 'type', "TEXT NOT NULL DEFAULT ''");
        add('webhook_events', 'recordId', "TEXT NOT NULL DEFAULT ''");
      }
      add('alerts', 'mailLabels', "TEXT NOT NULL DEFAULT ''");
      add('alerts', 'listUnsubscribe', 'INTEGER NOT NULL DEFAULT 0');
      add('alerts', 'classificationOverride', 'INTEGER NOT NULL DEFAULT 0');
      add('files', 'folderId', "TEXT NOT NULL DEFAULT ''");
      add('files', 'folderPathIds', "TEXT NOT NULL DEFAULT '[]'");
      db.exec(`CREATE TABLE folder_settings (connectionId TEXT PRIMARY KEY REFERENCES connections(id) ON DELETE CASCADE, folders TEXT NOT NULL DEFAULT '[]', updatedAt TEXT NOT NULL); PRAGMA user_version = 3;`);
    })();
    return { from: start, to: 3, integrity: db.pragma('integrity_check', { simple: true }) };
  } finally { db.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.length !== 4 || process.argv[2] !== '--approve-phase-one-upgrade') {
    console.error('This is an explicit data migration. After owner approval and a verified SQLite + JSON predeploy backup: node server/migrate-phase-one.mjs --approve-phase-one-upgrade /absolute/path/to/database.sqlite');
    process.exitCode = 1;
  } else {
    console.log(upgradePhaseOne(process.argv[3]));
  }
}
