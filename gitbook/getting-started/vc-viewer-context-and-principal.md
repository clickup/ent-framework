# VC: Viewer Context and Principal

One of the most important Ent Framework traits is that it always knows, "who" is sending some read/write query to the database. Typically, that "who" is a user who opens a web page, or on behalf of whom a background worker job is running, but it can be any other **Principal**. Such mechanism is very different from the "traditional" database abstraction layers or ORMs, that typically do not know, on whose behalf all the queries are sent.

To send a query, you must always have an instance of [VC](../../docs/classes/VC.md) class in hand (stands for **Viewer Context**). The most important property in a VC is `principal`, it's a string which identifies the party who's acting. Typically, we store some user ID in `vc.principal`.

It is intentionally not easy to create a brand new VC instance. In fact, you should only do it once in your app (this VC is called "root VC"), and all other VCs created should **derive** from that VC using its methods.

Below is a basic example for Express framework. (Of course you can use any other framework like Next.js or whatever. Express is here only for illustrative purposes, it has nothing to do with Ent Framework.)

{% code title="core/vcMiddleware.ts" %}
```typescript
import { VC } from "ent-framework";
import type { NextFunction, Request, Response } from "express";

const rootVC = VC.createGuestPleaseDoNotUseCreationPointsMustBeLimited();

declare global {
  namespace Express {
    interface Request {
      // This adds Request#vc property to all Express Request objects.
      vc: VC;
    }
  }
}

export async function vcMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  // Assuming you have some other middleware which authenticates the user.
  const userID = req.session.loggedInUserID ?? null;
  // ?!
  const user = userID ? await EntUser.loadX(rootVC.toOmniDangerous(), userID) : null;
  // Thanks to EntUser's privacyInferPrincipal rule, user.vc is auto-assigned
  // to a new derived VC with principal equals to user.id. We save it to req.
  req.vc = user.vc;
  next();
}
```
{% endcode %}

We will discuss what `loadX()` is in the next sections. In short, it loads an Ent from the database and throws an e**X**ception (this is what "X" stands for) if it doesn't exist.

Here comes the catch: `loadX()` requires to pass a VC whose principal is the user loading the data. And to derive that VC, we need to call `EntUser#loadX()`. In our case, it's obviously a "chicken and egg" problem, so we just derive a new VC in "god mode" with `vc.toOmniDangerous()` and allow Ent Framework to bypass privacy checks for the very 1st `EntUser` loaded.

Later in your code, add this middleware to the Express app, so all your route handlers will be able to access `req.vc`:

{% code title="core/app.ts" %}
```typescript
import { vcMiddleware } from "./vcMiddleware";

export const app = express();
...
app.use(mySessionAndAuthMiddlewares);
app.use(vcMiddleware);
...
app.get("/my-route", (req, res) => {
  console.log(req.vc);
  res.send("ok");
});
```
{% endcode %}
