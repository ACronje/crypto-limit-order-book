import { validate } from "jsonschema";
import limitOrderSchema from "../src/limitOrderSchema.json";

test("create limit order schema", () => {
  let payload = {
  };
  let validationResult = validate(payload, limitOrderSchema);
  expect(validationResult.valid).toBe(false);
  expect(validationResult.errors.toString()).toEqual("instance requires property \"quantity\",instance requires property \"price\",instance requires property \"side\"");

  payload = {
    quantity: 0,
    price: 0,
    side: "blah",
    postOnly: "blah"
  };
  validationResult = validate(payload, limitOrderSchema);
  expect(validationResult.valid).toBe(false);
  expect(validationResult.errors.toString()).toEqual("instance.quantity must be greater than or equal to 1,instance.price must be greater than or equal to 1,instance.side is not one of enum values: buy,sell,instance.postOnly is not of a type(s) boolean");

  payload = {
    quantity: 1,
    price: 2,
    side: "buy",
    postOnly: true
  };
  validationResult = validate(payload, limitOrderSchema);
  expect(validationResult.valid).toBe(true);
});
