const AWS = require("aws-sdk"),
      {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "us-east-2",
});

const util = require("../utils/util");
const getCartItemService = require("../utils/get_cart_item");

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const cartTable = "ecommerce_cart";

/**
 * Update item quantity in cart.
 *
 */
async function updateCart(cart_id, product) {
  const product_id = product.id;
  const quantity = product.quantity;
  if (!product_id || !quantity) {
    return util.buildResponse(401, {
      message: "Product ID and quantity are required",
    });
  }

  const dynamoCartItem = await getCartItemService.getCartItem(
    cart_id,
    product_id
  );
  if (!dynamoCartItem) {
    return util.buildResponse(401, {
      message: "Product does not exist in cart. Please add product to cart",
    });
  }

  const item = {
    cart_id: cart_id,
    product_id: product_id,
    quantity: quantity,
    expiration_time: dynamoCartItem.expiration_time, // expiration time stays same for now...
  };

  // update product in cart in db
  const updateCartItemResponse = await updateCartItem(item);
  if (!updateCartItemResponse) {
    return util.buildResponse(503, {
      message: "Server Error. Please try again later",
    });
  }

  return util.buildResponse(200, {
    cart_id: cart_id,
    product_id: product_id,
    quantity: quantity,
  });
}

async function updateCartItem(item) {
  const params = {
    TableName: cartTable,
    Key: {
      cart_id: item.cart_id,
      product_id: item.product_id,
    },
    UpdateExpression: "set quantity = :q, expiration_time = :e",
    ExpressionAttributeValues: {
      ":q": item.quantity,
      ":e": item.expiration_time,
    },
  };

  return await dynamodb
    .update(params)
    .then(
      () => {
        return true;
      },
      (error) => {
        console.error("There is an error updating cart item: ", error);
      }
    );
}

module.exports.updateCart = updateCart;
