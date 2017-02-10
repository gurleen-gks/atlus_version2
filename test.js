// file name :test.js
var pg = require('pg');
var express             = require('express');
var app                 = express();
var bodyParse           = require('body-parser')
var cookieParser        = require('cookie-parser') ;
var conString = "postgres://Fon:password@localhost:5432/test";
var search="";
var session = require('express-session');
var table = "pmd_uni";
var attribute = "design";
var application = "apache-accumulo";

var jsonObj = [{}];



app.use(cookieParser()) ;
app.use(bodyParse.urlencoded({extended:false})) ;
//app.use(express.bodyParser());
app.use(session({
cookie: {maxAge: 60 * 1000 * 30} ,
resave: true, // don't save session if unmodified
saveUninitialized: false, // don't create session until something stored
secret: 'ssaszhuoliangzhang'
}));





app.get('/',function(req,res){
  if (req.session.sign) {//检查用户是否已经登录
    console.log("hello"+req.session.name) ;//打印session的值

    res.sendFile('/Users/Fon/Documents/csci590/test2/public/main.html') ;
  } else {
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
  }
    
    console.log('main page is required ');
}) ;

app.post('/login',function(req,res){
    console.log('login clicked');
    name=req.body.name ;
    pwd=req.body.pwd   ;
//     var user = 'username';
// var pass = 'password';

// var auth = new Buffer(user + ':' + pass).toString('base64');
// var options = {
//   host: 'example.com',
//   port: 80,
//   path: '/path',
//   headers: {
//     'Authorization': 'Basic ' + auth
//   }
// };
// http.get(options, function(res) {
//   // response is here
// });

    var client = new pg.Client(conString);
    client.connect();
  console.log(req.body.name);
  var nstring="select password from registered_user where email='"+req.body.name+"'";
  var query = client.query(nstring);
  query.on('row', function(row) {
          console.log(row.password);
          if(row.password==req.body.pwd)
          {
             req.session.sign = true;
             req.session.name = req.body.name;
                 console.log("search request");
    search="'"+req.body.csha+"'";
    // var search="'c906e4ba6436b87b7cdfc168fc318f2ff27da279'";
     console.log(search);

  var client = new pg.Client(conString);
  client.connect();
    var queryStr = "select f1.csha as curr, f2.csha as prev,cts.cwhen as cwhen,cts.email as email, f1.design as f1_design, f2.design as f2_design, (f1.design-f2.design) as design from pmd_uni as f1, pmd_uni f2,cpairs as cpairs, commits as cts where cts.application=f1.application and f1.application='apache-accumulo' and f2.application=f1.application and f1.application=cpairs.application and f1.csha=cpairs.curr and f2.csha=cpairs.prev and cts.csha=f1.csha and cts.cwhen > '2016-09-01' order by cts.cwhen;";
    
    var query = client.query(queryStr, function(err, result) {
      jsonObj[0]['nodes'] = [];
      jsonObj[0]['links'] = [];

      var currSet = new Set();

      for (var i = 0;i < result.rows.length; i++) {
        var curr = result.rows[i].curr;
        if(!currSet.has(curr))
        {
          currSet.add(curr);
          
          var jsonObjNodes = {};
          jsonObjNodes["id"] = result.rows[i].curr;
          jsonObjNodes["time"] = result.rows[i].cwhen;
          jsonObjNodes["author"] = result.rows[i].email;
          jsonObjNodes["type"] = "circle";
          jsonObjNodes[table+"."+attribute] = result.rows[i].f2_design;

          jsonObj[0]['nodes'].push(jsonObjNodes);          

          
        }

        //var jsonObjLinks = {source: result.rows[i].prev,
        //                    target: result.rows[i].curr};

        var jsonObjLinks = {};
        jsonObjLinks["source"] = result.rows[i].prev;
        jsonObjLinks["target"] = result.rows[i].curr;
        jsonObjLinks[table+"__"+attribute] = result.rows[i].f1_design;
        
        jsonObj[0]['links'].push(jsonObjLinks);
        
        //jsonObj[0]['links'].push({source: result.rows[i].prev,
        //                          target: result.rows[i].curr
        //                        });


        
        var prev = result.rows[i].prev;
        if(!currSet.has(prev))
        {
          var client = new pg.Client(conString);
          client.connect();
          var commitInfoQueryStr = "SELECT application, csha, cwhen, message, branch, email from commits where application='"+application+"' and csha='"+prev+"';";

          var commitInfoQuery = client.query(commitInfoQueryStr, function(err, info) {
            for (var i = 0;i < info.rows.length; i++) {
              //jsonObj[0]['nodes'].push({id: info.rows[i].csha,
              //                        time: info.rows[i].cwhen,
              //                        author: info.rows[i].email,
              //                        type: "circle"
              //                      });

              var jsonObjNodes = {};
              jsonObjNodes["id"] = info.rows[i].csha;
              jsonObjNodes["time"] = info.rows[i].cwhen;
              jsonObjNodes["author"] = info.rows[i].email;
              jsonObjNodes["type"] = "circle";
            }
          });
        }         
      }

      
      //console.log(JSON.stringify(jsonObj));
      res.contentType('application/json');
      res.send(JSON.stringify(jsonObj));
      //return res.json(JSON.stringify(jsonObj));

      var fs = require('fs');
      fs.writeFile('test.json', JSON.stringify(jsonObj, null, 4));

    });
    
    query.on('end', function() {
        client.end();
    });

//   var query = client.query("SELECT application,csha FROM findbugs_type_category_uni where csha="+search);
//   var fs = require('fs');
//   var outputFilename = './my.json';
//     var myData;
//   query.on('row', function(row) {
//       console.log(row.application);
//       myData = {
//       nodes:[
//         {
//         applicationname:row.application,
//           csha:row.csha
//         } ,
//         {
      
//           csha:row.csha,
//           applicationname:row.application
//         }]
//       }
//     fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
//         if(err) {
//             console.log(err);
//         } else {
//           console.log("JSON saved to " + outputFilename);
//         }
//     });
//      // return res.json(myData);
//       //console.log("json....");

//   });


// query.on('end', function() {
//     client.end();
// });
  //res.render('/Users/Fon/Documents/csci590/test2/my.json');
  //res.sendFile('/Users/Fon/Documents/csci590/test2/my.json') ;
  // fileName='/Users/Fon/Documents/csci590/test2/my.json';
  // res.sendFile(fileName, function (err) {
  //   if (err) {
  //     console.log(err);
  //     res.status(err.status).end();
  //   }
  //   else {
  //     console.log('Sent:', fileName);
  //   }
  // });
             // res.redirect('/searchcsha');
             // console.log(req.session.sign);
              //res.sendFile('/Users/Fon/Documents/csci590/test2/public/main.html') ;
              //res.end(); 

           } 
           else
           {
            res.writeHead(200, {"Content-Type": "text/plain"});
            res.write("wrong email or login");
            res.end();
          }
     

 });


  query.on('end', function() {
    client.end();
});
  //res.end();

    
});
app.get('/logout', function (req,res) {
    req.session.sign = false;
    req.session.name = "";
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
}) ;
app.get('/add', function (req,res) {
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
    console.log('add page is required ') ;
}) ;
app.get('/goregister', function (req,res) {
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/register.html') ;
    console.log('register page is required ') ;
}) ;

app.post('/register',function(req,res){
    name=req.body.name ;
    pwd=req.body.pwd   ;
    eml=req.body.eml;
    var client = new pg.Client(conString);
    client.connect();
    var nstring="select COUNT(email) as count from registered_user where email='"+req.body.eml+"'";
    var query = client.query(nstring);
    query.on('row', function(row) {
    if(row.count==0)
    {
        nstring="insert into registered_user values('"+req.body.name+"','"+req.body.eml+"','"+req.body.pass+"')";
        query = client.query(nstring);
        query.on('row', function(row) {
             console.log(row.application);
     
     
         });
     

  // });


        query.on('end', function() {
             client.end();
        });
    
        req.session.sign = true;
        req.session.name = req.body.name;
        console.log(nstring);
        //res.redirect('/');
        //res.end();
        res.sendFile('/Users/Fon/Documents/csci590/test2/public/main.html') ;
        
      }
      else
      {
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("this email adress has been registered");
        res.end();
        //res.redirect("");
      }
      //   console.log(row.application);
       //res.write('/Users/Fon/Documents/csci590/test2/public/main.html');
       //res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
       //res.end(); 
      
    });
     

  // });


query.on('end', function() {
    client.end();
});

   
    
});








app.get('/search',function(req,res){
  if (req.session.sign) {//检查用户是否已经登录
    console.log("search request");
    //var search=req.body.csha;
     //var search="'c906e4ba6436b87b7cdfc168fc318f2ff27da279'";

  var client = new pg.Client(conString);
  client.connect();


  var query = client.query("SELECT application,csha FROM findbugs_type_category_uni where csha="+search);
  var fs = require('fs');
  var outputFilename = './my.json';
    var myData;
  query.on('row', function(row) {
      console.log(row.application);
      myData = {
      nodes:[
        {
        applicationname:row.application,
          csha:row.csha
        } ,
        {
      
          csha:row.csha,
          applicationname:row.application
        }]
      }
    fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
    });
     // return res.json(myData);
      //console.log("json....");

  });


query.on('end', function() {
    client.end();
});
  //res.render('/Users/Fon/Documents/csci590/test2/my.json');
  //res.sendFile('/Users/Fon/Documents/csci590/test2/my.json') ;
  fileName='/Users/Fon/Documents/csci590/test2/test.json';
  res.sendFile(fileName, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
  } else {
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
  }
	

}) ;

app.post('/searchcsha',function(req,res){
   if (req.session.sign) {//检查用户是否已经登录
    console.log("search request");
    search="'"+req.body.csha+"'";
    // var search="'c906e4ba6436b87b7cdfc168fc318f2ff27da279'";
     console.log(search);

  var client = new pg.Client(conString);
  client.connect();


  var query = client.query("SELECT application,csha FROM findbugs_type_category_uni where csha="+search);
  var fs = require('fs');
  var outputFilename = './my.json';
    var myData;
  query.on('row', function(row) {
      console.log(row.application);
      myData = {
      nodes:[
        {
        applicationname:row.application,
          csha:row.csha
        } ,
        {
      
          csha:row.csha,
          applicationname:row.application
        }]
      }
    fs.writeFile(outputFilename, JSON.stringify(myData, null, 4), function(err) {
        if(err) {
            console.log(err);
        } else {
          console.log("JSON saved to " + outputFilename);
        }
    });
     // return res.json(myData);
      //console.log("json....");

  });


query.on('end', function() {
    client.end();
});
  //res.render('/Users/Fon/Documents/csci590/test2/my.json');
  //res.sendFile('/Users/Fon/Documents/csci590/test2/my.json') ;
  fileName='/Users/Fon/Documents/csci590/test2/my.json';
  res.sendFile(fileName, function (err) {
    if (err) {
      console.log(err);
      res.status(err.status).end();
    }
    else {
      console.log('Sent:', fileName);
    }
  });
  } else {
    res.sendFile('/Users/Fon/Documents/csci590/test2/public/add.html') ;
  }
    
});
// 监听3000端口
var server=app.listen(3000) ;