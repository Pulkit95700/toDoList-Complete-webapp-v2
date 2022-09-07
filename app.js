const express = require("express");
const ejs = require("ejs");     
const app = express();
const _ = require("lodash");
//requiring mongoose

const mongoose = require("mongoose")
const dbName = "items";
//connecting to the server
mongoose.connect("mongodb://127.0.0.1:27017/"+dbName, {useNewUrlParser: true});

//making Schema for the items of our initial to do list
const itemSchema = new mongoose.Schema({
    name: String
})

//making the model for that schema
const item = mongoose.model("item", itemSchema);

//making our initial items
const item1 = new item({
    name: "Hello, Hope you are Good"
})

const item2 = new item({
    name: "This is a To-Do-List"
})

const item3 = new item({
    name: "Start Writing From Here"
})

const listItems = [item1, item2, item3]; //making an array of the items containing name

// -----------------------------------------

//second Collection Model

const listSchema = new mongoose.Schema({
    name: String,
    subLists: [itemSchema]
});

//making the model for that schema
const list = mongoose.model("list", listSchema);


// -----------------------------------------

//-------------------------------------------
const date = require(__dirname + "/date.js")


const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function(req, res){
    let currentDay = date.getDay();
    item.find({}, (err, foundItems)=>{
        if(err){
            console.log(err)
        }
        else{
            if(foundItems.length === 0){
                item.insertMany(listItems);
                res.redirect("/");
            }
            else{
                res.render("list", {listTitle: currentDay, items: foundItems});
                }
            }
        })
});

app.post("/", function(req, res){
    const title = req.body.button;
    let itemName = req.body.item;
    const newItem = new item({
        name: itemName 
     });
    if(req.body.button !== date.getDay()){
        list.find({name: title}, function(err, docs){
            if(err){
                console.log(err);
            }
            else{
                console.log(docs)
                docs[0].subLists.push(newItem);
                docs[0].save();
                res.render("list", {listTitle: title, items: docs[0].subLists})
            }
        })
    }
    else{
        newItem.save();
        res.redirect("/");
    }
});

app.post("/delete", function(req, res){
    const itemId = req.body.Id;
    const title = req.body.title;
    if(title !== date.getDay()){
        list.findOneAndUpdate({name: title},{$pull: {subLists : {_id : itemId}}}, function(err){
            if(!err){
                res.redirect("/"+title);
            }
        })
    }
    else{
        item.findByIdAndRemove(itemId, function(err, docs){});
        res.redirect("/")
    }
});
app.get("/:customName", function(req, res){
    const customName = _.capitalize(req.params.customName);
    list.findOne({name: customName}, function(err, listElement){
        if(err){
            console.log(err);
        }
        else{
            if(listElement){
                res.render("list", {listTitle: customName, items: listElement.subLists});
            }
            else{
                const newItem = new list({
                    name: customName,
                    subLists: listItems
                })
                newItem.save();
                res.render("list", {listTitle: customName, items: newItem.subLists});
            }
        }
    })
});
app.listen(3000, function(){
    console.log("Server is started and running up..");
})