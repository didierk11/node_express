const express = require("express");
var cors = require('cors');
const app = express();
app.use(cors());
const https = require("https");
const port = 3000;

let item_description;
let root = "https://api.mercadolibre.com/";

app.get("/api/items", function (req, res) {
  https.get(root + "sites/MLA/search?q=" + req.query.q, (result) => {
    let data = "";
    console.log("params" + JSON.stringify(req.query));
    result.on("data", (d) => {
      data += d;
    });
    result.on("end", () => {
      let obj = JSON.parse(data);
      obj.results.length = 4;
      let array = obj.results;
      let items = [];
      let filters = obj.filters;
      let available_filters = obj.available_filters;
      let array2;
      let array3;
      let categories = [];
      if (filters.length === 0) {
        array2 = obj.available_filters;
      } else {
        array2 = obj.filters;
      }
      array2.forEach((element) => {
        console.log(element.id);
        if (element.id == "category") {
          array3 = element.values;
        }
      });
      array3.forEach((element) => {
        categories.push(element.name);
      });
      array.forEach((element) => {
        let item_id = element.id;
        let item_title = element.title;
        let price = element.price.toString().split(".");
        let item_price = isNaN(parseInt(price[0])) ? 0 : parseInt(price[0]);
        let item_decimal = isNaN(parseInt(price[1])) ? 0 : parseInt(price[1]);

        console.log(element.price);

        let item_currency = element.currency_id;
        let item_condition = element.condition;
        let item_picture = element.thumbnail;
        let item_free_shipping = element.shipping.free_shipping;
        items.push({
          id: item_id,
          title: item_title,
          price: {
            currency: item_currency,
            amount: item_price,
            decimals: item_decimal,
          },
          picture: item_picture,
          condition: item_condition,
          free_shipping: item_free_shipping,
        });
      });
      let o = {
        author: {
          name: "Didier",
          lastname: "Merino",
        },
        categories: categories,
        items: items,
      };
      res.send(o);
    });
    result.on("error", (e) => {
      console.log(e);
    });
  });
});

app.get(
  "/api/items/:id",
  function (req, res, next) {
    https.get(root + "items/" + req.params.id + "/description", (result) => {
      let data = "";
      result.on("data", (d) => {
        data += d;
      });
      result.on("end", () => {
        console.log(data);

        let obj = JSON.parse(data);
        item_description = obj.plain_text;
        next();
      });
      result.on("error", (e) => {
        console.log(e);
      });
    });
  },
  function (req, res, next) {
    https.get(
      "https://api.mercadolibre.com/items/" + req.params.id,
      (result) => {
        let data = "";
        result.on("data", (d) => {
          data += d;
        });
        result.on("end", () => {
          console.log(data);

          let obj = JSON.parse(data);
          let item_id = obj.id;
          let item_title = obj.title;
          let price = obj.price.toString().split(".");
          let item_price = isNaN(parseInt(price[0])) ? 0 : parseInt(price[0]);
          let item_decimal = isNaN(parseInt(price[1])) ? 0 : parseInt(price[1]);

          let item_currency = obj.currency_id;
          let item_condition = obj.condition;
          let item_picture = obj.thumbnail;
          let item_free_shipping = obj.shipping.free_shipping;
          let item_sold_quantity = obj.sold_quantity;

          var obj_result = {
            author: {
              name: "Didier",
              lastname: "Merino",
            },
            item: {
              id: item_id,
              title: item_title,
              price: {
                currency: item_currency,
                amount: item_price,
                decimals: item_decimal,
              },
              picture: item_picture,
              condition: item_condition,
              free_shipping: item_free_shipping,
              sold_quantity: item_sold_quantity,
              description: item_description,
            },
          };
          res.send(JSON.stringify(obj_result));
        });
        result.on("error", (e) => {
          console.log(e);
        });
      }
    );
  }
);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
