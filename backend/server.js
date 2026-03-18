
// IMPORT MODULES

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();   // ← THIS LINE IS MISSING
app.use(cors());
app.use(express.json());


// CREATE EXPRESS APP

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
//=====================================================
// DATABASE CONNECTION
//=====================================================
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root123",
  database: "ecommerce"
});
db.connect((err) => {
  if (err) {
    console.log("Database connection failed");
  } else {
    console.log("Connected to MySQL database");
  }
});

//=====================================================
// USERS API
//=====================================================

//here the line customized

// GET ALL USERS
app.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.send("Error fetching users");
    } else {
      res.json(result);
    }
  });
});
//=====================================================
//MIDDLEWARE
//=====================================================

// REGISTER NEW USER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      res.send("Error inserting user");
    } else {
      res.send("User registered successfully");
    }
  });
});
//GET ALL PRODUCTS
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, result) => {
    if (err) {
      res.send("Error fetching products");
    } else {
      res.json(result);
    }
  });
});
// ADD NEW PRODUCT
app.post("/products", (req, res) => {
  const { name, price, description, stock } = req.body;

  const sql = "INSERT INTO products (name, price, description, stock) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, price, description, stock], (err, result) => {
    if (err) {
      res.send("Error inserting product");
    } else {
      res.send("Product added successfully");
    }
  });
});
//=====================================================
//CART API
//=====================================================

// ADD PRODUCT TO CART
app.post("/cart", (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  const sql = "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)";

  db.query(sql, [user_id, product_id, quantity], (err, result) => {
    if (err) {
      res.send("Error adding to cart");
    } else {
      res.send("Product added to cart");
    }
  });
});

// View cart items of a user
app.get("/cart/:user_id", (req, res) => {

const user_id = req.params.user_id;

const sql = `
SELECT cart.*, products.name, products.price, products.image
FROM cart 
JOIN products ON cart.product_id = products.id 
WHERE cart.user_id = ?
`;
   
  db.query(sql, [user_id], (err, result) => {
    if (err) {
      res.send("Error fetching cart");
    } else {
      res.json(result);
    }
  });
});
// ===============================
// ORDERS API
// ===============================

// Place order
app.post("/order", (req, res) => {

const { cart_id } = req.body;

const getSQL = "SELECT * FROM cart WHERE id=?";

db.query(getSQL,[cart_id],(err,result)=>{

if(err || result.length==0){
return res.send("Cart item not found");
}

const item = result[0];

const insertSQL = "INSERT INTO orders (user_id, product_id, quantity) VALUES (?,?,?)";

db.query(insertSQL,[item.user_id,item.product_id,item.quantity],(err2)=>{

if(err2){
return res.send("Order failed");
}

db.query("DELETE FROM cart WHERE id=?", [cart_id]);

res.send("Order placed successfully");

});

});

});
// View all orders
app.get("/orders", (req, res) => {
  db.query("SELECT * FROM orders", (err, result) => {
    if (err) {
      res.send("Error fetching orders");
    } else {
      res.json(result);
    }
  });
});

//for add to cart
function addToCart(productId){

fetch("http://localhost:3000/cart", {

method: "POST",
headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
user_id: 1,
product_id: productId,
quantity: 1
})

})
.then(res => res.text())
.then(data => alert(data))

} 

//function for placeorder button
function placeOrder(cartId){

fetch("http://localhost:3000/order",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({
cart_id: cartId
})

})
.then(res => res.text())
.then(data => alert(data))

}

//delete icon on cart

app.delete("/cart/:id", (req, res) => {

const id = req.params.id;

const sql = "DELETE FROM cart WHERE id = ?";

db.query(sql, [id], (err, result) => {
    if(err){
        res.send("Error deleting item");
    } else {
        res.send("Item removed from cart");
    }
});

});

// ============================================
// PLACE ORDER API
// ============================================

app.post("/order", (req, res) => {

const { cart_id } = req.body;

const getSQL = "SELECT * FROM cart WHERE id=?";

db.query(getSQL,[cart_id],(err,result)=>{

if(err || result.length==0){
return res.send("Cart item not found");
}

const item = result[0];

const insertSQL = "INSERT INTO orders (user_id, product_id, quantity) VALUES (?,?,?)";

db.query(insertSQL,[item.user_id,item.product_id,item.quantity],(err2)=>{

if(err2){
return res.send("Order failed");
}

db.query("DELETE FROM cart WHERE id=?", [cart_id]);

res.send("Order placed successfully");

});

});

});

// ============================================
// ADD PRODUCT (ADMIN)
// ============================================

app.post("/products", (req, res) => {

const { name, price, description, image } = req.body;

const sql = "INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)";

db.query(sql, [name, price, description, image], (err, result) => {

if(err){
res.send("Error adding product");
}
else{
res.send("Product added successfully");
}

});
});