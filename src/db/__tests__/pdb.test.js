var assert = require('assert')
var os = require('os')
var path = require('path')
var fs = require('fs-extra')
var pdb = require('../pdb')
var fixtures = require('./pdb.fixtures')

/* global beforeEach, describe, it */

describe('pdb', function () {
  var TEST_DIR, TEST_FILE

  beforeEach(function (done) {
    TEST_DIR = path.join(os.tmpdir(), 'obsdian-test', 'pdb-test')
    TEST_FILE = path.join(TEST_DIR, 'pdb.db')
    fs.emptyDir(TEST_DIR, done)
  })

  describe('createPdb()', function () {
    it('should create a database', function () {
      var db = pdb.createPdb()
      assert(db)

      // only one instance allowed for now
      var db2 = pdb.createPdb()
      assert.strictEqual(db, db2)
    })

    describe('> when file is passed', function () {
      it('should create database with file', function () {
        var db = pdb.createPdb({file: TEST_FILE})
        assert.strictEqual(db.file, TEST_FILE)
      })
    })

    describe('> when file is not passed', function () {
      it('should set the file', function () {
        var db = pdb.createPdb()
        assert(db.file.length > 0)
        assert.notEqual(db.file, TEST_FILE)
      })
    })
  })

  describe('init()', function () {
    describe('> when file does exist', function () {
      it('should create the file', function (done) {
        var db = pdb.createPdb({file: TEST_FILE})
        assert(!fs.existsSync(db.file))
        assert.strictEqual(db.data, null)

        var data = {names: {jp: {key: 'data'}}}
        fs.outputJsonSync(TEST_FILE, data)

        db.init(function (err) {
          assert.ifError(err)
          assert(fs.existsSync(db.file))
          assert.deepEqual(db.data, data)
          done()
        })
      })
    })

    describe('> when file does NOT exist', function () {
      it('should create the file', function (done) {
        var db = pdb.createPdb({file: TEST_FILE})
        assert(!fs.existsSync(db.file))
        db.init(function (err) {
          assert.ifError(err)
          assert(fs.existsSync(db.file))
          done()
        })
      })
    })
  })

  describe('add() / resolve()', function () {
    it('should add a record', function (done) {
      var f0 = fixtures.names[0]

      var db = pdb.createPdb({file: TEST_FILE})
      db.init(function (err) {
        assert.ifError(err)

        db.add(f0.name, f0.data, function (err) {
          assert.ifError(err)

          db.resolve(f0.name, function (err, data) {
            assert.ifError(err)
            assert.deepEqual(f0.data, data)
            done()
          })
        })
      })
    })
  })
})