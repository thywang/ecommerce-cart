const getCartService = require("./service/get_cart");
const putCartService = require("./service/put_cart");
const updateCartService = require("./service/update_cart");
const deleteCartService = require("./service/delete_cart");
const migrateCartService = require("./service/migrate_cart");
const util = require("./utils/util");

const healthPath = "/health";
const cartPath = "/cart";
const migrateCartPath = "/migrate-cart";

exports.handler = async (event) => {
  console.log("Request Event: ", event);
  let response;
  let cart_id = "";
  let old_cart_id = "";
  let new_cart_id = "";
  let product_id = 0;

  if (event.queryStringParameters && event.queryStringParameters.cart_id) {
    console.log("Received cart_id: " + event.queryStringParameters.cart_id);
    cart_id = event.queryStringParameters.cart_id;
  }

  if (event.queryStringParameters && event.queryStringParameters.product_id) {
    console.log(
      "Received product_id: " + event.queryStringParameters.product_id
    );
    product_id = parseInt(event.queryStringParameters.product_id);
  }

  if (event.queryStringParameters && event.queryStringParameters.old_cart_id) {
    console.log(
      "Received old_cart_id: " + event.queryStringParameters.old_cart_id
    );
    old_cart_id = event.queryStringParameters.old_cart_id;
  }

  if (event.queryStringParameters && event.queryStringParameters.new_cart_id) {
    console.log(
      "Received new_cart_id: " + event.queryStringParameters.new_cart_id
    );
    new_cart_id = event.queryStringParameters.new_cart_id;
  }

  switch (true) {
    case event.httpMethod === "GET" && event.path === healthPath:
      response = util.buildResponse(200);
      break;
    case event.httpMethod === "GET" && event.path === cartPath:
      response = getCartService.getCart(cart_id);
      break;
    case event.httpMethod === "POST" && event.path === cartPath:
      const putCartBody = JSON.parse(event.body);
      response = putCartService.putCart(cart_id, putCartBody);
      break;
    case event.httpMethod === "POST" && event.path === migrateCartPath:
      response = migrateCartService.migrateCart(old_cart_id, new_cart_id);
      break;
    case event.httpMethod === "PUT" && event.path === cartPath:
      const updateCartBody = JSON.parse(event.body);
      response = updateCartService.updateCart(cart_id, updateCartBody);
      break;
    case event.httpMethod === "DELETE" && event.path === cartPath:
      // if product id is given, just delete that item
      if (product_id) {
        response = deleteCartService.deleteCartItem(cart_id, product_id);
      } else {
        response = deleteCartService.deleteCart(cart_id);
      }
      break;

    default:
      response = util.buildResponse(404, "404 Not Found");
  }
  return response;
};
