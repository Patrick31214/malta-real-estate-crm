'use strict';

/**
 * addIndexIfNotExists — idempotent wrapper around queryInterface.addIndex.
 *
 * If the named index already exists the call is silently skipped, so
 * migrations can be re-run safely when a previous attempt was only
 * partially applied (indexes committed but migration not yet recorded
 * in SequelizeMeta).
 *
 * Detection uses both the PostgreSQL error code (42P07 = duplicate_object,
 * which PostgreSQL raises for "relation already exists") AND a message
 * pattern fallback so it works with other SQL dialects too.
 *
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {string}   table   - Table name
 * @param {string[]} columns - Column list
 * @param {object}   options - Options passed to queryInterface.addIndex
 */
async function addIndexIfNotExists(queryInterface, table, columns, options) {
  try {
    await queryInterface.addIndex(table, columns, options);
  } catch (err) {
    // err.parent is the raw driver error; code 42P07 is PostgreSQL's
    // "duplicate_object" (raised when an index name already exists).
    const pgCode = err.parent && err.parent.code;
    if (pgCode === '42P07' || /already exists/i.test(err.message)) {
      return; // expected — skip silently
    }
    throw err;
  }
}

module.exports = { addIndexIfNotExists };
