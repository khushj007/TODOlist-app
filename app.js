const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _ = require("lodash");
const mongoose = require("mongoose");

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
//VARIABLE DECLEARATION

let itemsA = [];
const day = date.getDate();

//DATABASE CODE

mongoose.connect("mongodb+srv://Admin-Khush:test123@cluster0.mnnfn6z.mongodb.net/todolistDB");

const todolistschema = mongoose.Schema({
name : String,
});

const listSchema = mongoose.Schema({
name : String,
items : [todolistschema] ,

});

const List = mongoose.model("list",listSchema);



const Itemcollection = mongoose.model("item",todolistschema);

const item1 = new Itemcollection({
name : "To add click on + with note",


});

const item2 = new Itemcollection({
name : "to cancle click on checkbox",
  
  
});

let defaultItems = [item1,item2];




// GETS REQUESTS

app.get("/", function(req, res) {
  



  Itemcollection.find(function(error,respond){

    if(respond.length === 0 )
    {
      Itemcollection.insertMany(defaultItems,function(err){
        if(err)
        {
          console.log(err);
        }

        else{
          console.log("default items logged in succesfully");
          res.redirect("/");
        }
        });
        
    }
   
    else{
      res.render("list", {listTitle: day, newListItems: respond});
    }
    
  
  });
  

 

});

//CUSTOM LISTS

app.get("/:topic", function(req,res){
  const address = _.capitalize(req.params.topic);
  
  //checking wheather the document exist witnin the collection or not 
  // function will return error and the document{if found}
  List.findOne({name : address},function(err,found){

    if(!err)
    {
      if(!found)
      {
          const Nlist = new List({
          name : address ,
          items : defaultItems ,

        });
      
        Nlist.save();

        res.redirect("/"+address);
        
      }
      else
      {
       res.render("list", {listTitle: address, newListItems: found.items });
      }

      
    }

  });
  

  
  
  

});


app.get("/about", function(req, res){
  res.render("about");
});


// POST REQUESTS

app.post("/", function(req, res){

  const Newitem = req.body.newItem;
  const Listname = req.body.list

  
  const item = new Itemcollection({
      name : Newitem , 
  });

  if(Listname === day)
  {
  item.save();  
  res.redirect("/");
  }
  else{
    List.findOne({name : Listname },function(err,found){
      found.items.push(item);
      found.save();
      res.redirect("/"+Listname);

    });
    

  }



});



app.post("/delete",function(req,res){

  const del = req.body.cbox;
  const Listnamee = req.body.Listname;

  if(Listnamee === day)
  {
    Itemcollection.findByIdAndRemove(del,function(err){});
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name : Listnamee},{$pull : {items : {_id:del} } },function(err,respond){})
    res.redirect("/"+Listnamee);
  }




  

});




app.listen(3000, function() {
  console.log("Server started on port 5000");
});
