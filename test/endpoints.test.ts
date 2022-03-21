import request from "supertest";
import app from "../src/app";
import { initialiseLimitOrderBooks } from "../src/lob/initialiseLimitOrderBooks";

test("end to end", done => {
  initialiseLimitOrderBooks();
  // check default orderbook and tradehistory response when orderbook is empty
  request(app)
    .get("/BTCZAR/orderbook")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "Asks": [],
        "Bids": [],
        "LastChange": null
      });
      done();
    });

  request(app)
    .get("/BTCZAR/tradehistory")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
      done();
    });

  // add a buy limit order and compare responses
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 10,
      "price": 4,
      "side": "buy",
      "postOnly": false 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: expect.any(String),
        transactionIds: []
      });
      done();
    }); 

  request(app)
    .get("/BTCZAR/orderbook")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "Asks": [],
        "Bids": [{
          "currencyPair": "BTCZAR",
          "orderCount": 1,
          "price": 4,
          "quantity": 10,
          "side": "buy", 
        }],
        "LastChange": expect.any(Number)
      });
      done();
    });

  request(app)
    .get("/BTCZAR/tradehistory")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
      done();
    });

  // add sell limit order and see transaction added and orderbook updated
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 5,
      "price": 4,
      "side": "sell",
      "postOnly": false 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: null,
        transactionIds: [expect.any(String)]
      });
      done();
    });

  request(app)
    .get("/BTCZAR/orderbook")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "Asks": [],
        "Bids": [{
          "currencyPair": "BTCZAR",
          "orderCount": 1,
          "price": 4,
          "quantity": 5,
          "side": "buy", 
        }],
        "LastChange": expect.any(Number)
      });
      done();
    });

  request(app)
    .get("/BTCZAR/tradehistory")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([{
          "id": expect.any(String),
          "currencyPair": "BTCZAR",
          "price": 4,
          "quantity": 5,
          "takerSide": "buy",
          "tradedAt": expect.any(Number)
        }]));
      done();
    });
});


test("buy that covers multiple sells", done => {
  initialiseLimitOrderBooks();
  const quotes = [
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 189,
    },
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 199,
    },
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 101,
    },
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 103,
    },
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 101,
    },
    {
      "side" : "sell", 
      "quantity" : 5, 
      "price" : 101,
    },
    {
      "side" : "buy", 
      "quantity" : 5, 
      "price" : 99,
    },
    {
      "side" : "buy", 
      "quantity" : 5, 
      "price" : 98,
    },
    {
      "side" : "buy", 
      "quantity" : 5, 
      "price" : 99,
    },
    {
      "side" : "buy", 
      "quantity" : 5, 
      "price" : 97,
    },
  ];

  quotes.forEach(quote => {
    request(app)
      .post("/BTCZAR/orders/limit")
      .send(quote).then(() => { done();});
  });

  // submit buy order that results in trade
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "side" : "buy", 
      "quantity" : 2, 
      "price" : 102,
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: null,
        transactionIds: [expect.any(String)]
      });
      done();
    });

  // submitting buy order, where only partially matched, results in outstanding quantity going into the book as an order
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "side" : "buy", 
      "quantity" : 50, 
      "price" : 102,
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: expect.any(String),
        transactionIds: [
          expect.any(String),
          expect.any(String),
          expect.any(String)]
      });
      done();
    });

  request(app)
    .get("/BTCZAR/orderbook")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        "Asks": [
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 103,
            "quantity": 5,
            "side": "sell",
          },
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 189,
            "quantity": 5,
            "side": "sell",
          },
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 199,
            "quantity": 5,
            "side": "sell",
          },
        ],
        "Bids": [
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 102,
            "quantity": 37,
            "side": "buy",
          },
          {
            "currencyPair": "BTCZAR",
            "orderCount": 2,
            "price": 99,
            "quantity": 10,
            "side": "buy",
          },
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 98,
            "quantity": 5,
            "side": "buy",
          },
          {
            "currencyPair": "BTCZAR",
            "orderCount": 1,
            "price": 97,
            "quantity": 5,
            "side": "buy",
          }],
        "LastChange": expect.any(Number)
      });
      done();
    });

  request(app)
    .get("/BTCZAR/tradehistory")
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([{
          "currencyPair": "BTCZAR",
          "id": expect.any(String),
          "price": 101,
          "quantity": 2,
          "takerSide": "sell",
          "tradedAt": expect.any(Number)
        },
        {
          "currencyPair": "BTCZAR",
          "id": expect.any(String),
          "price": 101,
          "quantity": 3,
          "takerSide": "sell",
          "tradedAt": expect.any(Number)
        },
        {
          "currencyPair": "BTCZAR",
          "id": expect.any(String),
          "price": 101,
          "quantity": 5,
          "takerSide": "sell",
          "tradedAt": expect.any(Number)
        },
        {
          "currencyPair": "BTCZAR",
          "id": expect.any(String),
          "price": 101,
          "quantity": 5,
          "takerSide": "sell",
          "tradedAt": expect.any(Number)
        }]));
      done();
    });

});


test("postOnly mode", done => {
  initialiseLimitOrderBooks();
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 5,
      "price": 4,
      "side": "sell",
      "postOnly": true 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: expect.any(String),
        transactionIds: []
      });
      done();
    });
    
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 50,
      "price": 4,
      "side": "sell",
      "postOnly": true 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: null,
        transactionIds: []
      });
      done();
    });
    
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 50,
      "price": 4,
      "side": "sell",
      "postOnly": false 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: expect.any(String),
        transactionIds: []
      });
      done();
    });
    
  request(app)
    .post("/BTCZAR/orders/limit")
    .send({
      "quantity": 50,
      "price": 4,
      "side": "sell",
      "postOnly": false 
    })
    .then(response => {
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        orderId: expect.any(String),
        transactionIds: []
      });
      done();
    });
});