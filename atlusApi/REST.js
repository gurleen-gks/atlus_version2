var promise = require("bluebird");
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var connectionString = 'postgres://postgres:enjoylife55@localhost:5432/test';
var db = pgp(connectionString);


function REST_ROUTER(router, connection, md5) {
    var self = this;
    this.router = router;
    //self.handleRoutes(router,connection,md5);
}

REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router = this.router;
    router.get("/atlusapi", function (req, res) {
        res.json({"Message": "Hello World !"});
    });

    router.get("/atlusapi/showNodes", function (req, res) {
        var app = req.query.application;
         console.log("App parameter : "+app);
        var filters = req.query.filters;
        console.log("Filter parameter : "+filters);
        var metric = req.query.metric;
        var table = req.query.table;
        db.any("select f1.csha as curr, f2.csha as prev,cts.cwhen as cwhen,cts.email as email, f1." + metric + " as f1_" + metric + ", f2." + metric + " as f2_" + metric + " , (f1." + metric + "-f2." + metric + ") as " + metric + " from " + table + " as f1, " + table + " as f2,cpairs as cpairs, commits as cts where cts.application=f1.application and f1.application='" + app + "' and f2.application=f1.application and f1.application=cpairs.application and f1.csha=cpairs.curr and f2.csha=cpairs.prev and cts.csha=f1.csha and " + filters + " order by cts.cwhen")
            .then(function (data) {
                var json = {nodes: [], links: []};
                var curr = new Set();
                var prevs = new Set();
                var promises = [];
                data.forEach(function (obj) {
                    if (!curr.has(obj.curr)) {
                        curr.add(obj.curr);
                        var myObj = {author: obj.email, id: obj.curr, time: obj.cwhen, type: "circle"};
                        myObj[metric + "." + table] = obj['f1_' + metric];
                        json.nodes.push(myObj);
                    }
                    prevs.add(obj.prev);
                    json.links.push({metric_name: app, source: obj.prev, target: obj.curr, value: obj.design});

                    prevs.forEach(function (prev) {
                        if (!curr.has(prev)) {
                            promises.push(db.any("select * from commits as cts," + table + " as f1 where cts.csha=f1.csha AND cts.csha='" + prev + "'").then(function (data) {
                                var remObj = {
                                    author: data[0].email,
                                    id: data[0].csha,
                                    time: data[0].cwhen,
                                    type: "circle"
                                };
                                remObj[metric + "." + table] = obj['f1_' + metric];
                                json.nodes.push(remObj);
                            }));
                        }
                    });
                });
                promise.all(promises).then(function () {
                    res.status(200)
                        .json({
                            status: "success",
                            data: json,
                            message: "All nodes retrieved"
                        });
                });
            })
            .catch(function (err) {
                console.log(err.stack);
                //return next(err);
            });
    });

    router.get("/atlusapi/allAuthors", function (req, res) {
        var app = req.query.application;
        db.any("select distinct email from commits as authors where application='"+app+"' order by email")
            .then(function (data) {
                res.status(200)
                    .json({
                        status: "success",
                        data: data,
                        message: "All metrics retreived"
                    });
            })
            .catch(function (err) {
                console.log(err.stack);
                //return next(err);
            });
    })

    router.get("/atlusapi/allApplications", function (req, res) {
        db.any("select distinct application from commits")
            .then(function (data) {
                res.status(200)
                    .json({
                        status: "success",
                        data: data,
                        message: "All metrics retreived"
                    });
            })
            .catch(function (err) {
                console.log(err.stack);
                //return next(err);
            });
    })
    router.get("/atlusapi/allMetrics", function (req, res) {
        db.any("select concat_ws('_',replace(table_name,' ','_'),column_name) as metric from information_schema.columns where table_name IN('pmd_uni','sonarqube_combined_issues_uni','findbugs_type_category_uni')")
            .then(function (data) {
                res.status(200)
                    .json({
                        status: "success",
                        data: data,
                        message: "All metrics retreived"
                    });
            })
            .catch(function (err) {
                console.log(err.stack);
                //return next(err);
            });
    })
};

module.exports = REST_ROUTER;