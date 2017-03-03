var pg = require('pg');
var promise = require("bluebird");
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
//var connectionString = 'postgres://postgres:enjoylife55@localhost:5432/test';
var connectionString = "postgres://Fon:password@localhost:5432/test";

var db = pgp(connectionString);
var session = require('express-session');

function REST_ROUTER(router, connection, md5) {
    var self = this;
    this.router = router;
    //self.handleRoutes(router,connection,md5);
}
function showNodes(req, res)
{

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
                    res.header('Access-Control-Allow-Origin', '*');
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
}
function allMetrics(req, res)
{
     db.any("select concat_ws('_',replace(table_name,' ','_'),column_name) as metric from information_schema.columns where table_name IN('pmd_uni','sonarqube_combined_issues_uni','findbugs_type_category_uni')")
            .then(function (data) {
                console.log('allMetric is queried');
                res.header('Access-Control-Allow-Origin', '*');
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
}
function allApplications(req, res) 
{
    db.any("select distinct application from commits")
            .then(function (data) {
                console.log('allApplication is queried');
                res.header('Access-Control-Allow-Origin', '*');
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
}
function allAuthors(req, res) 
{
    var app = req.query.application;
        db.any("select distinct email from commits as authors where application='"+app+"' order by email")
            .then(function (data) {
                console.log('allAuthors is queried');
                res.header('Access-Control-Allow-Origin', '*');
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
}

REST_ROUTER.prototype.handleRoutes = function (router, connection, md5) {
    router = this.router;
    router.get("/atlusapi", function (req, res) {
        res.json({"Message": "Hello World !"});
    });


    router.get("/atlusapi/showNodes", function (req, res) {
       // console.log(req.session.sign);

        if (req.session.sign) {
              showNodes(req, res);
        }  
        else
        {
             var client = new pg.Client(connectionString);
             client.connect();
             var email=req.query.email;
             var pwd=req.query.pwd;
             var nstring="select password from registered_user where email='"+email+"'";
             var query = client.query(nstring);
             query.on('row', function(row) {
                   // console.log(row.password);
                    if(row.password==pwd)
                    {
                          req.session.sign = true;
                          req.session.name = row.username;
                          showNodes(req, res);
                     }
                     else
                     {
                         console.log("wrong email or password");
                         res.write("wrong email or password");
                         res.end();
                     }
             });
              query.on('end', function() {
               client.end();
             });

        }
    });

    router.get("/atlusapi/allAuthors", function (req, res) {
         //console.log(req.session.sign);

        if (req.session.sign) {
              allAuthors(req, res);
          }
        else
        {
             var client = new pg.Client(connectionString);
             client.connect();
             var email=req.query.email;
             var pwd=req.query.pwd;
             var nstring="select password from registered_user where email='"+email+"'";
             var query = client.query(nstring);
             query.on('row', function(row) {
                    //console.log(row.password);
                    if(row.password==pwd)
                    {
                          req.session.sign = true;
                          req.session.name = row.username;
                          allAuthors(req, res) ;

                     }
                     else
                     {
                        console.log("wrong email or password");
                         res.write("wrong email or password");
                         res.end();
                     }
             });
              query.on('end', function() {
               client.end();
             });
          }
    });

    router.get("/atlusapi/allApplications", function (req, res) {
       // console.log(req.session.sign);
        if (req.session.sign) {
              allApplications(req, res);
        }  
        else
        {
             var client = new pg.Client(connectionString);
             client.connect();
             var email=req.query.email;
             var pwd=req.query.pwd;
             var nstring="select password from registered_user where email='"+email+"'";
             var query = client.query(nstring);
             query.on('row', function(row) {
                    if(row.password==pwd)
                    {
                          req.session.sign = true;
                          req.session.name = row.username;
                          allApplications(req, res);
                     }
                     else
                     {
                        console.log("wrong email or password");
                         res.status(200)
                             .json({
                                status: "fail",
                                message: "wrong email or password"
                             });
                         res.end();
                     }
             });
              query.on('end', function() {
               client.end();
             });
          }
    });
    router.get("/atlusapi/allMetrics", function (req, res) {
       //console.log(req.session.sign);

        if (req.session.sign) {
              allMetrics(req, res);
        }  
        else
        {
             var client = new pg.Client(connectionString);
             client.connect();
             var email=req.query.email;
             var pwd=req.query.pwd;
             var nstring="select password from registered_user where email='"+email+"'";
             var query = client.query(nstring);
             query.on('row', function(row) {

                    if(row.password==pwd)
                    {
                          req.session.sign = true;
                          req.session.name = row.username;;
                          allMetrics(req, res);
                     }
                     else
                     {
                         console.log("wrong email or password");
                         res.status(200)
                             .json({
                                status: "fail",
                                message: "wrong email or password"
                             });
                         res.end();
                     }
             });
              query.on('end', function() {
               client.end();
             });

        }
        
    });
    router.get("/login", function (req, res) {
       res.append("Access-Control-Allow-Origin", "*");   
 //console.log(res);
        if (req.session.sign) {
             console.log("logged in");
             res.end();
              //allMetrics(req, res);
        }  
        else
        {
             var client = new pg.Client(connectionString);
             client.connect();
             //var email="zhuoliaz@usc.edu" ;
             //var  pwd="11231209"  ;
             var email=req.query.email;
             var pwd=req.query.pwd;
             var nstring="select password from registered_user where email='"+email+"'";
             var query = client.query(nstring);
             query.on('row', function(row) {

                    if(row.password==pwd)
                    {
                          req.session.sign = true;
                          req.session.name = row.username;
                          console.log("logged in"); 
                            res.status(200)
                             .json({
                                status: "success",
                                username:row.username,
                                message: "Logged in"
                             });
                             res.end();
                            // console.log(res);

                     }
                     else
                     {
                         console.log("wrong email or password");
                         res.status(200)
                             .json({
                                status: "fail",
                                message: "wrong email or password"
                             });
                         res.end();
                     }
             });
              query.on('end', function() {
               client.end();
             });
               

        }

     });
    // router.post("/loginpost", function (req, res) {
      

    //     if (req.session.sign) {
    //          console.log("logged in");
    //          res.end();
    //           //allMetrics(req, res);
    //     }  
    //     else
    //     {
    //          // var client = new pg.Client(connectionString);
    //          // client.connect();
    //          // //var email="zhuoliaz@usc.edu" ;
    //          // //var  pwd="11231209"  ;
    //          // var email=req.body.email;
    //          // var pwd=req.body.pwd;
    //          // var nstring="select password from registered_user where email='"+email+"'";
    //          // var query = client.query(nstring);
    //          // query.on('row', function(row) {

    //          //        if(row.password==pwd)
    //          //        {

    //          //              req.session.sign = true;
    //          //              req.session.name = row.username;;
    //          //               console.log("logged in"); //allMetrics(req, res);
    //          //               // res.header('Access-Control-Allow-Origin:*');  

    //          //               // res.header('Access-Control-Allow-Methods:POST');  
  
    //          //               // res.header('Access-Control-Allow-Headers:x-requested-with,content-type');
    //          //               //  res.status(200)
    //          //               //   .json({
    //          //               //      status: "success",
    //          //               //      message: "Logged in"
    //          //               //   });
    //          //                 console.log(res);

    //          //               res.end();
    //          //         }
    //          //         else
    //          //         {
    //          //             console.log("wrong email or password");
    //          //             res.write("wrong email or password");
    //          //             res.end();
    //          //         }
    //          // });
    //          //  query.on('end', function() {
    //          //   client.end();
    //          // });
    //            res.end();

    //     }

    //  });

    router.get('/logout', function (req,res) {
      res.append("Access-Control-Allow-Origin", "*");   
      req.session.sign = false;
      req.session.name = "";
      console.log("logged out");
      console.log(req.session.sign);
      res.status(200)
                             .json({
                                status: "success",
                                message: "Logged out"
                             });
      res.end();

    });
    router.get('/register',function(req,res){
        res.append("Access-Control-Allow-Origin", "*");   
        eml=req.query.email;
        name=req.query.name ;
        pwd=req.query.pwd   ;
        console.log(eml+" "+name);
        var client = new pg.Client(connectionString);
        client.connect();
        var nstring="select COUNT(email) as count from registered_user where email='"+eml+"'";
        var query = client.query(nstring);
        query.on('row', function(row) {
            if(row.count==0)
             {
                nstring="insert into registered_user values('"+name+"','"+eml+"','"+pwd+"')";
                query = client.query(nstring);
                query.on('row', function(row) {
                     console.log("insert into registered_user");
                 });

                query.on('end', function() {
                     client.end();
                });
    
               // req.session.sign = true;
               // req.session.name = row.username;
                 console.log("hi"+name+"register successfully, start query");
                  res.status(200)
                             .json({
                                status: "success",
                                username:row.username,
                                message: "register successfully"
                             });
                  res.end();
        
            }
             else
            {
              console.log("this email adress has been registered");
              res.status(200)
                             .json({
                                status: "fail",
                                message: "this email adress has been registered"
                             });
             // res.write("this email adress has been registered");
               res.end();
             }
     
        });
     

         query.on('end', function() {
          client.end();
        });

   
    
    });
     router.get('/checkemail',function(req,res){
        res.append("Access-Control-Allow-Origin", "*");   
        eml=req.query.email;
        var client = new pg.Client(connectionString);
        client.connect();
        var nstring="select COUNT(email) as count from registered_user where email='"+eml+"'";
        var query = client.query(nstring);
        query.on('row', function(row) {
            if(row.count==0)
             {
                  res.status(200)
                             .json({
                                status: "success",
                                message: "unused email"
                             });
                  res.end();
        
            }
             else
            {
              console.log("this email adress has been registered");
              res.status(200)
                             .json({
                                status: "fail",
                                message: "this email adress has been registered"
                             });
             // res.write("this email adress has been registered");
               res.end();
             }
     
        });
     

         query.on('end', function() {
          client.end();
        });

   
    
    });



};

module.exports = REST_ROUTER;