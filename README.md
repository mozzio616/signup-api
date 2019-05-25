# One-Time Token API

## Generate One-Time Token

### Usage

```
POST /token/:email
{
    "channel": "@my_slack_id (option)"
}

HTTP/1.1 201 Created
{
    "message": "Token sent to your email or slack"
}
```

## Verify One-Time Token

```
GET /token/:email?token=123456

HTTP/1.1 200 OK
{
    "message": "Verified"
}
```

## Environment Variables

```
export SG_API_KEY="YOUR_SENDGRID_API_KEY"
export WEBHOOK_URL="YOUR_SLACK_WEBHOOK_URL"
```

```
now secret add sg-api-key "YOUR_SENDGRID_API_KEY"
now secret add webhook-url "YOUR_SLACK_WEBHOOK_URL"
```
