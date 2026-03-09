# User To-Dos

## AWS Infrastructure — SQS Bookings Queue

Steps required to get the CDK stack provisioned and working in production.

---

### 1. Create an AWS Account (if not already done)

- Sign up at https://aws.amazon.com
- Enable MFA on the root account immediately
- Create an IAM Identity Centre user (or IAM user) for deployments — do not use root credentials

---

### 2. Note your AWS Account ID

- AWS Console → top-right account menu → copy the 12-digit account ID
- You'll need this in step 5

---

### 3. Install AWS CLI

```bash
brew install awscli
aws --version
```

---

### 4. Configure AWS credentials locally

```bash
aws configure
# Enter: Access Key ID, Secret Access Key, default region (eu-west-1), output format (json)
```

Verify it works:

```bash
aws sts get-caller-identity
# Should return your account ID, user ID, and ARN
```

---

### 5. Set the deploy account environment variable

```bash
# Add to ~/.zshenv so it persists across sessions
echo 'export CDK_DEPLOY_ACCOUNT=<your-12-digit-account-id>' >> ~/.zshenv
source ~/.zshenv
```

---

### 6. Ensure Node 24 is active

```bash
nvm use 24
node --version  # should print v24.x.x
```

---

### 7. Bootstrap CDK into your account (one-time only)

This creates the S3 bucket and IAM roles the CDK CLI needs to deploy assets.

```bash
pnpm --filter=aws-infrastructure exec cdk bootstrap \
  --context env=prod \
  aws://<your-account-id>/eu-west-1
```

You should see `✅ Environment aws://<account>/eu-west-1 bootstrapped` when done.

---

### 8. Preview the changes (dry run)

```bash
pnpm --filter=aws-infrastructure diff:prod
```

Review the output — you should see two SQS queues being created:

- `bookings-prod`
- `bookings-dlq-prod`

---

### 9. Deploy

```bash
pnpm --filter=aws-infrastructure deploy:prod
```

Confirm the IAM changes when prompted (`y`).

Deployment takes ~1–2 minutes. On success you'll see the four CloudFormation outputs:

- `bookings-queue-url-prod`
- `bookings-queue-arn-prod`
- `bookings-dlq-url-prod`
- `bookings-dlq-arn-prod`

---

### 10. Verify in the AWS Console

- Go to **SQS** → **eu-west-1**
- Confirm both queues exist with the correct names
- Click the main queue → **Send and receive messages** → send a test message → confirm it appears

---

### 11. Set up a DLQ alarm (recommended)

Once the queue is live, create a CloudWatch alarm to alert when messages land in the DLQ:

- Console → **CloudWatch** → **Alarms** → Create alarm
- Metric: `SQS > Queue Metrics > ApproximateNumberOfMessagesVisible` for `bookings-dlq-prod`
- Threshold: ≥ 1
- Action: send to an SNS topic → email notification

> Note: this alarm should eventually be added to the CDK stack itself.

---

### 12. Add GitHub Actions secrets

Go to **GitHub → repo → Settings → Secrets and variables → Actions** and add:

| Secret                  | Value                                     |
| ----------------------- | ----------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Access key ID for the IAM deploy user     |
| `AWS_SECRET_ACCESS_KEY` | Secret access key for the IAM deploy user |
| `CDK_DEPLOY_ACCOUNT`    | Your 12-digit AWS account ID              |

The IAM user needs at minimum:

- `AmazonSQSFullAccess`
- `CloudFormationFullAccess`
- `IAMFullAccess` (CDK bootstrap creates IAM roles)
- `SSMReadOnlyAccess` (CDK reads bootstrap version from SSM)
- `S3FullAccess` (CDK uploads assets to the bootstrap bucket)

> Best practice: create a dedicated `github-actions-deploy` IAM user with only these permissions rather than using your personal credentials.

---

### 13. Save the queue URL for the API

The API will need the queue URL to send booking events. Add it to the API's environment config:

```bash
# Get the URL
aws sqs get-queue-url --queue-name bookings-prod --region eu-west-1

# Add to apps/skye-hosts-api/.env-files/.production.env (or Heroku config vars)
SQS_BOOKINGS_QUEUE_URL=https://sqs.eu-west-1.amazonaws.com/<account-id>/bookings-prod
```
