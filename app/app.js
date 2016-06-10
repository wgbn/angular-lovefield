'use strict';

angular.module('angular-lovefield', [])
    .provider('$lovefield', function () {

        var schemaBuilder = lf.schema.create('lovefield_db', 2);
        var db;

        return {
            init: function () {
                schemaBuilder.connect().then(function (_db) {
                    db = _db;
                });
            },
            tableBuilder: function (_tablename) {
                return schemaBuilder.createTable(_tablename);
            },
            $get: function () {
                function _insert(_tableName, _value) {
                    var table = db.getSchema().table(_tableName);
                    var row = table.createRow(_value);
                    return db
                        .insertOrReplace()
                        .into(table)
                        .values([row])
                        .exec()
                        .then(function() {
                            return db
                                .select()
                                .from(table)
                                .exec();
                        });
                }

                function _getAll(_tableName) {
                    var table = db.getSchema().table(_tableName);
                    return db
                        .select()
                        .from(table)
                        .exec();
                }

                function _query(_tableName) {
                    var table = db.getSchema().table(_tableName);
                    return db
                        .select()
                        .from(table)
                }

                return {
                    insert: _insert,
                    getAll: _getAll,
                    query: _query
                };
            }
        };
    })

    .run(function () {
        console.log('.run()');
    })

    .config(function ($lovefieldProvider) {
        console.log('.config()');

        $lovefieldProvider
            .tableBuilder('Notes')
            .addColumn('id', lf.Type.INTEGER)
            .addColumn('note', lf.Type.STRING)
            .addColumn('register', lf.Type.DATE_TIME)
            .addPrimaryKey(['id'], true)
            .addIndex('idxRegister', ['register'], false, lf.Order.DESC);

        $lovefieldProvider.init();
    })

    .controller('main', function ($scope, $lovefield) {
        console.log('.controller(main)');

        $scope.insertClick = function () {
            var note = {
                note: 'Get a cup of coffee',
                register: new Date()
            };

            $lovefield.insert('Notes', note)
                .then(function(results){
                    console.log(results);
                });
        }
    })
;
