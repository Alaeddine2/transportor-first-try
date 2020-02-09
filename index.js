// Import Packages
var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
var crypto = require('crypto');
var express = require('express');
var bodyParser = require('body-parser');

//Password ULTILS
//Create FUNCTION TO RANDM SALT 
var genRandomString=function(Length){
    return crypto.randomBytes(Math.ceil(Length/2)).toString('hex').slice(0,Length);//convert to HEXA format//
};

var sha512 = function(password,salt){
    var hash = crypto.createHmac('sha512',salt);
    hash.update(password);
    var value = hash.digest('hex');
    return{
        salt:salt,
        passwordHash:value
    };

};
function saltHashPassword(userpassword){
    var salt = genRandomString(16);// Create Random 16 charachteres
    console.log("salt=  "+salt);
    var passwordData = sha512(userpassword,salt);
    return passwordData;

};
function checkHashPassword(userPassword,salt){
    var passwordData=sha512(userPassword,salt);
    return passwordData;
};
//Create Express service
var app = express();
//to make body's
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Create Mongodb Client
var MongoClient = mongodb.MongoClient;

//Connection URL 
var url = 'mongodb://localhost:27017'//port
MongoClient.connect(url,{useNewUrlParser: true},function(err,client){
    if(err){
        console.log('Unable to connect to the mongo server ',err);

    }else{
        app.get('/',(request, response,next)=>{
            var post_data = request.body;
            response.json('HHello World');
        });
        //Register(works Fine)
        app.post('/register',(request, response,next)=>{
            var post_data = request.body;


            var plaint_password = post_data.password;
            console.log("PW "+post_data.password);
            var hash_data = saltHashPassword(plaint_password);
            var password = hash_data.passwordHash;//save password hash
            var salt = hash_data.salt;// Save salt
            
            var Fname = post_data.Fname;//getname
            console.log("Fname "+post_data.Fname);
            var email = post_data.Email;//getemail  
            var CIN = post_data.CIN;//getcin    
            var age = post_data.AGE;//getage
            var Role = post_data.Role;//getRole

            var insertJSON = {
                'email':email,
                'password':password,
                'salt':salt,
                'Fname':Fname,
                'CIN':CIN,
                'age':age,
                'Role':Role
            };
            var db = client.db('transpertor');

            //Check exist email
            db.collection('user').find({'email':email}).count(function(err,number){
                if(number !=0){
                    response.json('Email already exisits');
                    console.log('Email already exisits');
                }else{
                    //Insert data 
                    db.collection('user').insertOne(insertJSON,function(error,res){
                        response.json('Registration sucess');
                        console.log('Registration sucess');   
                    });

                }
            });

        });
        //Login(works Fine)
        app.post('/login',(request,response,next)=>{
            var post_data = request.body;
            //console.log(request);
            console.log(request.query);

            var email = post_data.Email;
            var userpassword = post_data.password;
            console.log("email "+post_data.Email);
            console.log("password "+post_data.password);
            var db = client.db('transpertor');

            //Check exist email
            db.collection('user').find({'email':email}).count(function(err,number){
                //console.log("number "+number);
                if(number ==0){
                    response.json('Email not exisits');
                    console.log('Email not exisits');
                }else{
                    //Find email
                    db.collection('user').findOne({'email':email},function(err,user){
                        console.log("user "+user.password);
                        var salt = user.salt;//get salt from user 
                        console.log("salt "+user.salt);
                        var hased_pw = checkHashPassword(userpassword,salt).passwordHash;
                        var encrypted_pw = user.password; //Get password from users
                        if(hased_pw==encrypted_pw){
                            response.json('Login sucess');
                            console.log('Login sucess');
                        }else{
                            response.json('wrong password');
                            console.log('wrong password');
                        }

                    })
                    
                }
            });

        });
        //Insertion des donneés des factures
        app.post('/facture',(request, response,next)=>{
            var post_data = request.body;


            var date_insertion = post_data.date_insertion;
            console.log("Date "+post_data.date_insertion);     
            var Creator = post_data.Creator;//getname
            console.log("Creator "+post_data.Creator);
            var Email_col = post_data.Email_col;//getemail  
            var Product = post_data.Product;//getcleint    
            var TotalePrix = post_data.TotalePrix;//getproduct
            var Lat = post_data.Lat;//getPrix
            var Long = post_data.Long;
            var insertJSON1 = {
                'Creator':Creator,
                'date_insertion':date_insertion,
                'Email_col':Email_col,
                'Product':Product,
                'TotalePrix':TotalePrix,
                'Lat':Lat,
                'Long':Long
            };
            var db = client.db('transpertor');

            //Insertion des données
            db.collection('facture').insertOne(insertJSON1,function(error,res){
                if(error) throw error;
                response.json('L entregistrement des infos a été effectuer avec sucess');
                console.log('L entregistrement des infos a été effectuer avec sucess');   
            });

        });
        //Get all Product data
        app.post('/product/get',(request, response,next)=>{
            var post_data = request.body;


            var selector = post_data.selector;
            var db = client.db('transpertor');
            
            if(selector == "all"){
                db.collection('Products').find({}).count(function(err,number){
                    if(err) console.log(err);
                    console.log("number "+number);
                    if(number ==0){
                        response.json('Products is empty');
                        console.log('Products is empty');
                    }else{
                        db.collection('Products').find({}).toArray(function(err,result){
                            if(err) console.log(err);
                            response.json(result);
                            console.log(result);
                    });
                }
            });
            }else{
                db.collection('Products').find({'id':selector}).count(function(err,number){
                    if(number ==0){
                        response.json('produit not exist');
                        console.log('produit not exist');
                    }else{
                        db.collection('Products').findOne({'id':selector},function(err,res){
                            if(err) console.log(err);
                            response.json(res);
                            console.log('Sending produit scess!');
                    });
                }
            });
            } 

        });
        
        //Insertion des donneés des collections(works Fine) 
        app.post('/collect',(request, response,next)=>{
            var post_data = request.body;


            var date_creation_col = post_data.date_creation_col ;
            console.log("Date "+post_data.date_creation_col);     
            var creator = post_data.creator;//getname
            console.log("creator name "+post_data.creator);
            var emailcol = post_data.emailcol;//getemail  
            var nom_col = post_data.nom_col;//getcol 
            var long_col =   post_data.long_col;//getlong
            var lat_col =   post_data.lat_col;//getlat
            var tel_fix_col = post_data.tel_fix_col;//getproduct
            var tel_mobile_col = post_data.tel_mobile_col;
            var adress_col = post_data.adress_col;
            var heure_matin_col =   post_data.heure_matin_col;
            var heure_apresmatin_col =   post_data.heure_apresmatin_col;
            var type =   post_data.type;
            var imagePath =   post_data.imagePath;

            var insertJSON1 = {
                'date_creation_col':date_creation_col,
                'creator':creator,
                'emailcol':emailcol,
                'nom_col':nom_col,
                'long_col':long_col,
                'lat_col':lat_col,
                'tel_fix_col':tel_fix_col,
                'tel_mobile_col':tel_mobile_col,
                'adress_col':adress_col,
                'heure_matin_col':heure_matin_col,
                'heure_apresmatin_col':heure_apresmatin_col,
                'type':type,
                'imagePath':imagePath
            };
            var db = client.db('transpertor');

            //Insertion des données
            db.collection('collection').insertOne(insertJSON1,function(error,res){
                if(error) throw error;
                response.json('L entregistrement des infos de pt de collection a été effectuer avec sucess');
                console.log('L entregistrement des infos de pt de collection a été effectuer avec sucess');   
            });

        });
        //-----------Get Collection data---------------//(works Fine) 
        app.post('/collect/get',(request,response,next)=>{
            var post_data = request.body;
            var selector = post_data.selector;
            //console.log(post_data.selector);
            //var selector = "all";
            var db = client.db('transpertor');
            
            if(selector == "all"){
                db.collection('collection').find({}).count(function(err,number){
                    if(err) console.log(err);
                    console.log("number "+number);
                    if(number ==0){
                        response.json('collection is empty');
                        console.log('collection is empty');
                    }else{
                        db.collection('collection').find({}).toArray(function(err,result){
                            if(err) console.log(err);
                            response.json(result);
                            //console.log(result);
                    });
                }
            });
            }else{
                db.collection('collection').find({'emailcol':selector}).count(function(err,number){
                    if(number ==0){
                        response.json('Col not exist');
                        console.log('Col not exist');
                    }else{
                        db.collection('collection').findOne({'emailcol':selector},function(err,res){
                            if(err) console.log(err);
                            response.json(res);
                            console.log('Sending scess!');
                    });
                }
            });
            }
        });
        app.post('/collect/delete',(request,response,next)=>{
            var post_data = request.body;
            var selector = post_data.selector;
            console.log(selector);
            var db = client.db('transpertor');

            db.collection('collection').find({'emailcol':selector}).count(function(err,number){
                if(number ==0){
                    response.json('Col not exist');
                    console.log('Col not exist');
                }else{
                    db.collection('collection').deleteOne({'emailcol':selector}, function(err, obj) {
                        if (err) throw err;
                        response.json('Deleted!');                        
                        console.log("doc deleted");
                });
            }
        });

        });
        //-------------------Get All facture data
        app.post('/facture/get',(request,response,next)=>{
            var post_data = request.body;
            var selector = post_data.selector;
            //console.log(post_data.selector);
            //var selector = "all";
            var db = client.db('transpertor');
            
            if(selector == "all"){
                db.collection('facture').find({}).count(function(err,number){
                    if(err) console.log(err);
                    console.log("number "+number);
                    if(number ==0){
                        response.json('facture is empty');
                        console.log('facture is empty');
                    }else{
                        db.collection('facture').find({}).toArray(function(err,result){
                            if(err) console.log(err);
                            response.json(result);
                            console.log(result);
                    });
                }
            });
            }else{
                db.collection('facture').find({'Email_col':selector}).count(function(err,number){
                    if(number ==0){
                        response.json('Col not exist');
                        console.log('Col not exist');
                    }else{
                        console.log('number :' + number);
                        db.collection('facture').find({'Email_col':selector}).toArray(function(err,res){
                            if(err) console.log(err);
                            response.json(res);
                            console.log('Sending scess!');
                    });
                }
            });
            }
        });
        app.post('/facture/get/agent',(request,response,next)=>{
            var post_data = request.body;
            var selector = post_data.selector;
            var selector1 = post_data.selector1;
            //console.log(post_data.selector);
            //var selector = "all";
            var db = client.db('transpertor');
            
            if(selector == "all"){
                db.collection('facture').find({}).count(function(err,number){
                    if(err) console.log(err);
                    console.log("number "+number);
                    if(number ==0){
                        response.json('facture is empty');
                        console.log('facture is empty');
                    }else{
                        db.collection('facture').find({}).toArray(function(err,result){
                            if(err) console.log(err);
                            response.json(result);
                            console.log(result);
                    });
                }
            });
            }else{
                db.collection('facture').find({'Email_col':selector,'Creator':selector1}).count(function(err,number){
                    if(number ==0){
                        response.json('Col not exist');
                        console.log('Col not exist');
                    }else{
                        console.log('number :' + number);
                        db.collection('facture').find({'Email_col':selector,'Creator':selector1}).toArray(function(err,res){
                            if(err) console.log(err);
                            response.json(res);
                            console.log('Sending scess!');
                    });
                }
            });
            }
        });
        app.listen(3000,()=>{
            console.log('Connected to Mongodb server,Webserver runnning on port 3000...')
        })
    }
});

