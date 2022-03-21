# crypto-limit-order-book


## Pre-requisites
- Node (v16.11.1) and NPM (v8.0.0)

## Before running the application the first time
```bash
npm install
npm run build
```

## Running the server
```bash
npm run serve
```

## Running tests
```bash
npm run test
```

## Consuming endpoints

### Get top 3 Asks and Bids.

request:
```bash
curl http://localhost:3000/BTCZAR/orderbook -H 'Content-Type: application/json'
```
response:
```bash
{
    "LastChange": 1647887448202,
    "Asks": [
        {
            "side": "sell",
            "quantity": 1,
            "price": 105,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        },
        {
            "side": "sell",
            "quantity": 3,
            "price": 110,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        },
        {
            "side": "sell",
            "quantity": 6,
            "price": 150,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        }
    ],
    "Bids": [
        {
            "side": "buy",
            "quantity": 8,
            "price": 100,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        },
        {
            "side": "buy",
            "quantity": 10,
            "price": 6,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        },
        {
            "side": "buy",
            "quantity": 10,
            "price": 4,
            "currencyPair": "BTCZAR",
            "orderCount": 1
        }
    ]
}
```


### Get tradehistory (TODO: pagination)

request:
```bash
curl http://localhost:3000/BTCZAR/tradehistory -H 'Content-Type: application/json'
```

response:
```bash
[
    {
        "price": 100,
        "quantity": 1,
        "currencyPair": "BTCZAR",
        "tradedAt": 1647887371501,
        "takerSide": "buy",
        "id": "c858f6ec-5f1d-4870-b577-94eb59cdda1f"
    },
    {
        "price": 100,
        "quantity": 1,
        "currencyPair": "BTCZAR",
        "tradedAt": 1647887380429,
        "takerSide": "buy",
        "id": "d130f87b-7c80-4993-8472-bd98e023b15f"
    }
]
```

### Create buy limit order

request:
```bash
curl -i -X POST http://localhost:3000/BTCZAR/orders/limit -H 'Content-Type: application/json' -d '{ "quantity": 1, "price": 1, "side": "buy" }'
```

response:
```bash
# this request resulted in an order being added to the order book
{
    "orderId": "54267065-c7cf-4c57-8c56-e535c93bc0f3",
    "transactionIds": []
}
```

### Create sell limit order

request:
```bash
curl -i -X POST http://localhost:3000/BTCZAR/orders/limit -H 'Content-Type: application/json' -d '{ "quantity": 1, "price": 1, "side": "sell" }'
```

response:
```bash
# this request resulted in an immediate trade (market order) as indicated by null orderId (no order added to book) and populated transactionIds list
{
    "orderId": null,
    "transactionIds": [
        "6b4f7dae-0b4e-4be9-8ea5-8f56004c9bf7"
    ]
}
```
### Buy order in postOnly mode

request:
```bash
curl -i -X POST http://localhost:3000/BTCZAR/orders/limit -H 'Content-Type: application/json' -d '{ "quantity": 1, "price": 1, "side": "buy", "postOnly": true }'
```

response
```bash
# this request resulted in no action (not a market maker) as indicated by null orderId and empty transacstionIds list
{
    "orderId": null,
    "transactionIds": []
}
```

## Linting / code formatting
If you're using vscode, the .vscode folder contains config to automatically format ts and js files on save if you've installed the eslint vscode extension.
