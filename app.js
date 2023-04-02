//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemsSchema ={
  name : String
};

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item ({
  name:"welcome to your todolist!"
});

const item2 = new Item({
  name:"Hit the + button to add a new item."
})

const item3 =  new Item({
  name:"<-- Hit this to delete an item."
})

const defaultItems = [ item1,item2,item3];

const listSchema ={
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);



// Item.insertMany(defaultItems,function(err){
//    if (err){
//     console.log(error);
//    }else{db.
//     console.log("Successfully added array!!");
//    }
// });

// Item.insertMany(defaultItems).then(function () {
//   console.log("Successfully saved defult items to DB");
// }).catch(function (err) {
//   console.log(err);
// });


app.get("/", async function(req, res) {

   const users= await Item.find({});

   if (users.length === 0){
     Item.insertMany(defaultItems).then(function () {
       console.log("Successfully saved defult items to DB");
     }).catch(function (err) {
       console.log(err);
     });
     res.redirect("/");
   } else {

  res.render("list", {listTitle: "Today", newListItems: users});
   }
});

app.get ("/:customListName",async(req,res)=>{
  try{
    const customListName = _.capitalize(req.params.customListName);
   data = await List.findOne({name:customListName});
   if (!data){
    const list = new List ({
      name:customListName,
      items:defaultItems
    })
    list.save();
    await sleep(1000)
    function sleep(ms) {
    return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
    res.redirect("/" + customListName);
    
   } else {
    res.render("list",{listTitle:data.name, newListItems:data.items});
   }
  } catch(e){
    console.log(e);
  }
 
});



app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
      name:itemName
  });

  if (listName==="Today"){
    item.save();
    res.redirect ("/");
  } else {
      const updateList = await List.findOne({name:listName});
      updateList.items.push(item);
      updateList.save();
      res.redirect("/" + listName);
      
   } 
  
  });


  app.post("/delete",async function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName=req.body.listName;
   
    

    if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function () {
      console.log("Successfully deleted the items from DB");
    }).catch(function (err) {
      console.log(err);
    });
    res.redirect("/")
  }else{
   
    await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}});
    
    res.redirect("/" + listName);

  }

    });
      




  



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
