# OAuth2.0

A fully-fledged authorization service for your microservice architecture. You can directly integrate this service with your API Gateway or any other microservice.

**WARNING: You are requested to add your keys to the **bin** folder. However, the existing keys are for development use only. All the passwords, etc., are for development purposes only.**

# Overview

The description for the APIs can be found in the routes folder [here](https://github.com/joshibhaumik/OAuth2.0/tree/main/src). This microservice keeps track of Users and their Sessions (Refresh Tokens). However, it is not keeping track of the access tokens. You can use public keys at the Gateway to verify a session.

If you have to add more User information, or columns you can edit the entities [here](https://github.com/joshibhaumik/OAuth2.0/blob/main/src/entities/User.ts) and **typeorm** will alter the table accordingly.

A user can delete their account and can recover the account back in 30 days, which can be changed as well.

I would recommend checking the [FAQ](#faq) section if any queries.

# Installations

Getting this microservice up and running is quite simple.

## Steps

1. Rename **.env-sample** to **.env** and complete it up.
1. Run command __```yarn install```__ or __```npm install```__ in your terminal.
1. Copy your **RS256** keys to **bin** folder. The filename in the code can be changed [here](https://github.com/joshibhaumik/OAuth2.0/blob/main/src/helpers/generateToken.ts). Make sure to remove the development keys.

_The good thing with **typeorm** is, it automatically creates the tables by replicating the entity structure._

## For Development

For development, purposes run.

```
yarn watch
```

And the changes can be monitored.

## For Production

For making the production-ready build. Run

```
yarn build && yarn start
```

```yarn build``` will build the production-ready bundle in the __dist__ folder, with your **RS256** keys. ```yarn start``` will run that bundle.

# FAQ

### 1. What if someone deletes their account? Can anyone else use the same username to register?

Yes, when users delete their account, their username is changed by appending N length random characters. Let say your username is **demo**, and you choose to delete your account. After deletion, your username will be - demo12345678_0, where N is 10.

### 2. Who will send the verification/restore token?

I have assumed you have a service that will either send an email or an SMS containing an account verification token or account restore token. That's why account verification token on user signup and restore token on user deletion is issued. **However, you have to send back the **token** itself to this service to verify the user or to restore the deleted account.**

### 3. There are many security leaks!

Actually, every request received by this service is assumed to pass through a Gateway or a service in front. The rest of the security is taken into the consideration while developing this microservice.

### 4. Where can I find the userId, which is asked by the service?
The tokens that you receive, when verified by the API Gateway using a public key, give you the __userId__ and the __sessionId__ with which it is associated.