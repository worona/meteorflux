# MeteorFlux - a reactive Flux framework

[![Join the chat at https://gitter.im/worona/meteorflux](https://badges.gitter.im/worona/meteorflux.svg)](https://gitter.im/worona/meteorflux?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

[![Build Status](https://travis-ci.org/worona/meteorflux.svg?branch=devel)](https://travis-ci.org/worona/meteorflux)

*MeteorFlux was created and is actively maintained by [@luisherranz](https://github.com/LuisHerranz) from [@worona](https://github.com/worona).*

After a lot of work figuring out how to use **Flux** and **Meteor** together, we have come up with **MeteorFlux**, a complete framework for creating **simple, scalable and reactive** apps in **Meteor** under the **Flux principles**.

> The **MeteorFlux** project started like a port of the Facebook's Flux Dispatcher. Many people is using it but it doesn't embrace any of the reactivity Meteor uses. That's the reason we created the new **MeteorFlux**. The old Dispatcher can be found here: https://github.com/worona/meteorflux/tree/devel/packages/dispatcher

If you are here, it probably means you already like **Meteor** but you want/need a way to organise the code of your app so it is scalable, easy to understand, easy to reason about and easy to debug. You probably heard about **Flux**, the Facebook's MVC alternative and wonder if it can be used with **Meteor**.

Well, I have good news, **Flux** and **Meteor** can play really well together. Let's start from the beginning!

## What is Flux and why do I need it?

Most people using **Meteor** today come from creating *"server side"* or *"page based"* websites. The user asks for a url and the server returns the correct page. MVC is great with that.

But users don't want *"page based"* websites anymore. Users want **apps**. Things like [Trello](https://www.trello.com), [Slack](https://www.slack.com), [Facebook](https://www.facebook.com) or even content sites like [Medium](https://www.medium.com). Client side, state based, realtime apps. Even the brand new WordPress dashboard called [Calypso](https://developer.wordpress.com/calypso/) behaves like an app and  was built using **Flux**.

**Meteor** is a great step forward in that direction and it gives us a lot of useful tools, but it doesn't have (or impose) any architecture. It doesn't tell us how we should organize our code.

**Flux** is a new architecture created by Facebook for their reactive apps. Although they released to the public only 2 years ago, they have been using it for some more time. It has a new set of principles to make it simpler and easier to reason about than MVC:

  - It decouples data/logic and views using an event bus: the **Dispatcher**.
  - The data/logic is organized by common domains: the **Stores**.
  - **Views** are not allowed to change the app state, only to dispatch **Actions**.
  - It makes the data flow simpler (one-way only) and forbids cascading events.

Most **Flux** principles aren't new, it has a lot in common with old architectures like Domain-Driven Design (DDD) or Command-Query Responsibility Segregation (CQRS).

Don't worry, more on these principles later.

## Flux official documentation

The first time **Facebook** talked about **Flux** was in the F8 conference. This [YouTube video](https://www.youtube.com/watch?list=PLb0IAmt7-GS188xDYE-u1ShQmFFGbrk0v&t=621&v=nYkdrAPrdcw) became quite popular.

Then they released the [official documentation](https://facebook.github.io/flux).
It is probably not the best docs ever, but people have written dozens of good posts about Flux:

  - [Flux For Stupid People](http://blog.andrewray.me/flux-for-stupid-people/)
  - [What is Flux?](http://fluxxor.com/what-is-flux.html)
  - [Getting To Know Flux](https://scotch.io/tutorials/getting-to-know-flux-the-react-js-architecture)
  - [What is the Flux
  Application Architecture?](https://medium.com/brigade-engineering/what-is-the-flux-application-architecture-b57ebca85b9e)
  - [Understanding Flux](https://medium.com/@garychambers108/understanding-flux-f93e9f650af7)

I am sure there are more since my research so a Google search should do it. Be aware that they all use JavaScript and React (don't expect Meteor).

## Can Flux be used in Meteor?

Yes it can. **Flux** is just an architecture, a set of principles. Actually, it can be a great idea if you are looking for a modern architecture to organize your code.

The old **MeteorFlux** Dispatcher worked fine and many people is still using it, but **Flux** apps are **Action-driven** and **Meteor** reactivity is **Data-driven** so a tighter integration was needed for a perfect match.

## Do I need React?

No, you don't. [React](https://facebook.github.io/react/) is just a frontend framework and **Flux** is an architecture. You can use it if you like, but the **Flux** principles can be applied even if you use [Blaze](https://www.meteor.com/blaze), [Angular](https://angularjs.org/), [ViewModel](http://viewmodel.meteor.com/), [Blaze Components](http://components.meteor.com/), [Flow Components](https://github.com/meteorhacks/flow-components) or whatever comes out next month.

## Is Flux the best architecture for everything?

I don't think so. But it can be useful for many things. **Flux** apps are easy to understand and reason about. A lot of **Meteor** apps lack architecture. Logic and state are spread among the different parts of the app and there is no way to know where is what. Debugging, scaling and testing becomes difficult.

When you choose an architecture you spend less time thinking *"where do I put this"* and more time just coding, because it is clear where things belong and how they are structured. In the long run, it helps you make your app easier to understand, easier to test and easier to scale.


## Different Flux Implementations

There are dozens of implementations out there and even other big companies have open sourced their own:

  - [Fluxible (Yahoo)](http://fluxible.io/)
  - [NuclearJS (Optimizely)](https://github.com/optimizely/nuclear-js)
  - [Redux](http://rackt.github.io/redux/)
  - [ReFlux](https://github.com/spoike/refluxjs)
  - [Alt](http://alt.js.org/)
  - [Flummox](http://acdlite.github.io/flummox)
  - [Marty](http://martyjs.org/)
  - [Fluxxor](http://fluxxor.com/)

All these implementations are good examples of what people is doing with the **Flux** principles.

## Flux concepts and principles

**Flux** is based on a **one way data flow**:

1.- When the user interacts with the app (he clicks something for example) the **View** dispatches an **Action**.

**Flux** decouples **Views** (*Blaze Templates* or *React components*) from logic/data (**Stores**) using a message bus (**Dispatcher**).

In code, it looks like this:
```javascript
Template.product.events({
  'click .add-to-cart': function() {
    Dispatch('PRODUCT_ADDED_TO_CART', { productId: ... });
  }
});
```

The most important thing to remember is: **Views CANNOT have any logic.** They can only dispatch actions with info about that action.

2.- **Store** callbacks receive that **Action**. They are the only ones which can have logic and modify the data.

In code, it looks like this:
```javascript
// In CartStore.js:
Register(function() {
  if (Action.is('PRODUCT_ADDED_TO_CART')) {
    Cart.insert({ productId: Action.productId });
  }
});

// You can have as many Stores as you want. For example, AnalyticsStore.js:
Register(function() {
  if (Action.is('PRODUCT_ADDED_TO_CART')) {
    Mixpanel.track('User added a product to the cart');
  }
});
```

3.- **State** represents the only truth of the app. **Views** shouldn't have access to any data but **State**.

In code it looks like this:

```javascript
State.modify('Cart.items', (state = []) => {
  return Cart.find({});
});

State.modify('Cart.isEmpty', (state = false) => {
  if (State.get('Cart.items').length === 0)
    return true;
  else
    return false;
});

State.modify('Cart.isOpen', (state = false) => {
  switch (Action.type()) {
    case 'CART_OPENED':
      return true;
    case 'CART_CLOSED':
    case 'GOTO_CHECKOUT':
      return false;
    default:
      return state;
  }
})
```

4.- **Views** automatically render themselves again when **State** changes.

In code, this looks something like this:

```html
{{#if Cart.isOpen}}
  <div class="cart">
    {{#if Cart.isEmpty}}
      <span>Sorry, not items here.</span>
    {{else}}
      {{#each Cart.items}}
        <div class="item">
          {{name}}: ${{price}}
        </div>
      {{/each}}
    {{/if}}
  </div>
{{/if}}
```

This is the Flux' **one-way-data-flow**. It usually starts with a user action and it ends with a new DOM render.

![Meteor Flux](https://raw.githubusercontent.com/worona/meteorflux/devel/assets/MeteorFlux-one-way-flow.png)

**Actions** must be declarative and not imperative. For example, use `SOMETHING_HAPPENED` or `USER_DID_SOMETHING` and not `SET_THAT_VARIABLE_TO_FALSE`.

```javascript
Template.someView.events({
  'click .some-button': function(){
    Dispatch('SOMETHING_HAPPENED', { data: "some data" });
  };
});
```

**Stores** are in charge of logic and updating the **State**. They are divided by *domain* and they register to the **Actions** they want to act upon. For example:

```javascript
// YourSomethingStore.js
Register(() => {
   switch(Action.type()){
       case "SOMETHING_HAPPENED":
           changeSomething(Action.data);
           break;
      case "OTHER_THING_HAPPENED":
           changeOtherThing(Action.data);
           break;
    }
});
```

**Stores** can't dispatch **Actions** in the middle of a dispatch, to avoid complex cascading of events. That means they must do whatever your app needs to do in response to the original action, without triggering anything else.

At first, this may appear restrictive, but it is very useful. Cascading events can be a hell to debug. Each time you want to use cascading events you have to think twice and come out with a simpler design.

You can queue **Actions**, which is different. If your user did two things at once, then it's fine to use this:

```javascript
Template.someForm.events({
  'submit .someForm': function(){
    Dispatch('PROFILE_CHANGED', { name: "John" })
       .then('TWITTER_ACCOUNT_LINKED', { account: "@john" });
  };
});
```

Just keep in mind the second one will start when the first one has finished completely.

**Stores** are the only ones which can modify the data and they can do it only in response to an **Action**. They don't have setters.

**Store** methods should be easily testable using unit tests. When they get complex they can (and should) use libraries to simplify their logic.

Finally, **Views** can retrieve data from the **State**. We are in Meteor, so we can do that reactively:

```javascript
Template.someView.helpers({
  'someData': function(){
    return State.get('some.data'); // reactive
  }
});
```

Or you can access the **State** directly if you prefer:

```html
This is {{some.data}}!
```

Don't worry about the details, we will explain the API later.

## Where are the Stores?

In **MeteorFlux**, you can decide how to organise your **Stores**. For example, one **Store** can be a javascript file called `CartStore.js`, maybe a folder called `CartStore` with different files `cart-actions.js`, `cart-methods.js`, `cart-state.js` or even a new private package called `myapp:cart-store` with its own structure inside.

The important thing to remember about **Stores** is that each store represents a domain of your app. Domains are not linked to one **Meteor** collection. For example, `CartStore` can use the `Cart` and the `Products` collections if it needs to.

Be aware that all the **Flux** flow happens in the client.

# MeteorFlux framework

## The idea behind MeteorFlux

**Flux** is a great way to know what is really happening in your app and decouple your logic from your views, but it is **Action Driven**. Meteor is a great framework to write complex apps, but it is **Data Driven**.

To join both worlds and get the best from them, you can use **MeteorFlux**:

- When an **Action** is dispatched, `Register()` callbacks are triggered before anything else. Use them to write to the database, for example. These functions will be called only once.
- After that, the **Reactive** phase starts and all the **Meteor** reactive functions are triggered. These include any **Tracker.autorun** callbacks using `Action.type()` or `Action.is()` or any `State.modify()` function. These functions will be called as many times as they need if their reactive sources are invalidated not only by `Action` but by other reactivity.
- Once all the reactivity has finished and **State** is stable again, the `AfterAction()` callbacks are triggered. Use them when you need to do things related with the updated **State** which can't be triggered more than once, like for example analytics or logging.

## Installation

Just add it to your Meteor project using:

```
$ meteor add meteorflux:meteorflux
```

## MeteorFlux API

### Dispatch(type, payload)

You can use `Dispatch()` when something happens. It accepts an object containing at least a `type` field, or a string as first parameter and an object as second parameter:

```javascript
Dispatch('SOMETHING_HAPPENED', { data: 'some data' });
Dispatch({ type: 'SOMETHING_HAPPENED', data: 'some data' });
```

### Action.type()

After the **Dispatch**, you have access to the payload using the **Action** object inside any of the callback functions (**Register**, **State.modify**, or **AfterAction**).

```javascript
// Inside Register(), State.modify() or AfterAction():
switch (Action.type()) {
  case 'SOMETHING_HAPPENED':
    doSomething();
    break;
  default:
    doDefault();
}
// or maybe...
let type = Action.type();
if (type.startsWith === 'SHOW_') {
  doSomething();
}
```

It is reactive inside **State.modify** callbacks, but not in **Register** or **AfterAction**.

### Action.is(type)

```javascript
// Inside Register(), State.modify() or AfterAction():
if (Action.is('NEW_POST_ADDED')) {
  doSomething();
}
```

Like `Action.type()`, it is reactive inside **State.modify** callbacks, but not in **Register** or **AfterAction**.

### Action.payload()

It gives you access to the payload of the **Action**:

```javascript
// From your Templates
Dispatch('NEW_POST_ADDED', { title: 'New post', slug: '/new-post' })

// Inside Register(), State.modify() or AfterAction():
if (Action.is('NEW_POST_ADDED')) {
  let payload = Action.payload();
  addPost(payload.title, payload.slug);
}
```

### Action.payload

You can access the payload values directly from Action as well.

```javascript
// From your Templates
Dispatch('NEW_POST_ADDED', { title: 'New post', slug: '/new-post' })

// Inside Register(), State.modify() or AfterAction():
if (Action.is('NEW_POST_ADDED')) {
  addPost(Action.title, Action.slug);
}
```

Be aware that `Action.payload()` is **NOT REACTIVE**. Only `Action.type()` and `Action.is()` are.

### Register(callback)

The **Register** callbacks will be called first when **Action** is dispatched. They are **NOT REACTIVE** and are called only once.

```javascript
Register(() => {
  if (Action.is('SOMETHING_HAPPENED')) {
    doSomething(Action.data);
  }
});
```

You can access **State**, but it won't be updated with any changes yet. **State** is updated in the **Reactive** phase.

**Register** callbacks are only **RUN ONCE** when the action is dispatched.

They are usually used for tasks which need to be run only once and have direct relation to the **Action**. For example, writing to the database.

```javascript
Register(() => {
  switch (Action.type()) {
    case 'NEW_POST_ADDED':
      let title = Action.title;
      let slug = Action.slug;
      Meteor.call('addPost', { title, slug });
      break;
    case 'POST_DELETED':
      Meteor.call('deletePost', Action.id);
      break;
  }
});
```

### State.modify(path, function)

In **MeteorFlux** you have access to a global **State** object to store all the state of your application. We have used MeteorFlux ReactiveState for that, so you can learn more about it here:
https://github.com/worona/meteorflux/tree/devel/packages/reactive-state

Typically, you may want to use `State.modify()` when you want to change the **State**. They will be invalidated in the **Reactive** phase.

Its use is inspired by the [Redux](rackt.github.io/redux/) Flux implementation but adapted to **Meteor** reactivity.

```javascript
State.modify('selectedPost', (state = false) => {
  switch(Action.type()) {
    case 'NEW_POST_SELECTED':
      return Action._id;
    case 'POST_DELETED':
      return false;
    default:
      return state;
  }
});
```

You don't need to use **Action** if you don't want to. For example, this works just fine:

```javascript
State.modify('posts.items', (state = []) => {
  return Posts.find();
});
```

```javascript
let handle = Meteor.subscribe('posts');
State.modify('posts.isReady', (state = false) => {
  return !!handle && handle.ready();
});
```

### AfterAction(callback)

**AfterAction** callbacks are used for logs, analytics or other calls to 3rd party services which only have to be called once, but after you know all the **State** is final.

They are **NOT REACTIVE** and called only once, after all **Reactive** functions have finished.

```javascript
AfterAction(() => {
  switch (Action.type()) {
    case 'SHOW_POST':
      let postTitle = State.get('post.title');
      analytics.track('Post visited: ' + postTitle);
      break;
    case 'POST_DELETED':
      let postId = State.get('post.id');
      analytics.track('Post deleted: ' + postId);
      break;
  }
});
```

## Blaze Events

If you use Blaze you can dispatch directly from your html.

In your HTML code add `dispatch` to any `a`, `button` or `form`.

```html
<a href='#' dispatch='SOMETHING_HAPPENED'>Something!</a>
<!-- or -->
<button dispatch='BUTTON_PUSHED'>Something!</button>
<!-- or -->
<form dispatch='FORM_SENT'>
  <input type="text" name="username">
  <input type="submit" name="Send!">
</form>
```

It will send a **Flux** action with a payload like this:

```javascript
{
  type: 'SOMETHING_HAPPENED',
  context: // the data context. Equivalent to 'this'.
  event: // the event which triggered the action.
  template: // the template in where the action was triggered.
}
```

### Blaze Data context

If you use it inside a `{{#with}}` or a `{{#each}}` block, you will get the data context in `context`.

```html
{{#each posts}}
  <h1>{{title}}</h1>
  <p>{{content}}</p>
  {{#if favorite}}
    <button dispatch='UNFAVORITE_THIS_POST'>Remove from favorites!</button>
  {{else}}
    <button dispatch='FAVORITE_THIS_POST'>Add to favorites!</button>
  {{/if}}
{{/each}}
```

You will get the post `_id` inside `context`:

```javascript
Register(funciton() {
  switch(Action.type()) {
  case 'FAVORITE_THIS_POST':
    var postId = Action.context._id;
    Posts.update(postId, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    var postId = Action.context._id;
    Posts.update(postId, { $set: { favorite: false } } );
    break;
  }
});
```

If you dispatch the same action from javascript, remember you still have to use `context`, so it is compatible with the helper. For example:

```javascript

var post = Posts.findOne();

Dispatch('FAVORITE_THIS_POST', { context: { _id: post._id } });

```

If you don't like this behavior, pass the data you need instead.

### Passing other data

You can pass other data using the data attribute `data-key`. For example:

```html
<span>Software Version: {{softwareVersion}}</span>
<button dispatch='INCREASE_VERSION' data-version={{softwareVersion}}>
    Increase version
</button>
```

And it will be passed in the `payload` like this:

```javascript
{
  type: 'INCREASE_VERSION',
  version: 1.2.0 // the value of {{softwareVersion}}
  context: // the data context. Equivalent to 'this'.
  event: // the event which triggered the action.
  template: // the template in where the action was triggered.
}
```

*The key of `data-key` has to be different than `type`, `context`, `event` and `template`.*

If the key has hyphens, it will convert it to camelcase. For example, `data-user-name` will be converted to `userName`.

---

It's probably a good idea to pass the `_id` of the context whenever you can, instead of relaying on `context._id`.

For example:

```html
{{#each posts}}
  <h1>{{title}}</h1>
  <p>{{content}}</p>
  {{#if favorite}}
    <button
      dispatch='UNFAVORITE_THIS_POST'
      data-id={{_id}}>
      Remove from favorites!
    </button>
  {{else}}
  <button
    dispatch='FAVORITE_THIS_POST'
    data-id={{_id}}>
    Add to favorites!
  </button>
  {{/if}}
{{/each}}
```

And your callback would be:

```javascript
Register(funciton() {
  switch(Action.type()) {
  case 'FAVORITE_THIS_POST':
    Posts.update(Action.id, { $set: { favorite: true } } );
    break;
  case 'UNFAVORITE_THIS_POST':
    Posts.update(Action.id, { $set: { favorite: false } } );
    break;
  }
});
```

This would make your actions more reusable.

### Blaze template object

Like in normal Meteor events, you can access the template using `Action.template`.

### Blaze event object

Like in normal Meteor events, you can access the event which triggered the action with `Action.event`.

### Form data

Like in normal Meteor events, you can get the form values in `event.currentTarget.name-of-the-input.value`.

But you can access them as well in the `payload`. For example:
```html
<body>
  <form dispatch='SOMETHING_HAPPENED'>
    <input type="text" name="text" value="Text Example">
    <input type="submit" name="submit" value="Submit">
    <input type="checkbox" name="vehicle1" value="Bike">I have a bike<br>
    <input type="checkbox" name="vehicle2" value="Car" checked> I have a car<br>
    <input type="radio" name="gender" value="Male"><br>
    <input type="radio" name="gender" value="Female" checked><br>
  </form>
</body>
```
It will have this `payload`:
```javascript
{
  type: 'INCREASE_VERSION',
  text: 'Text Example', // Value for input with name 'text'
  vehicle1: false, // Checked for checkbox with name 'vehicle1'
  vehicle2: true, // Checked for checkbox with name 'vehicle2'
  gender: 'Female' // Value for checked radio with name 'gender'
  context: {...}, // the data context. Equivalent to 'this'.
  event: {...}, // the event which triggered the action.
  template: {...} // the template in where the action was triggered.
}
```

## Use everything together

If you understand this example, then you are probably good to go!

```javascript
Register(() => {
  switch (Action.type()) {
    case 'PRODUCT_ADDED_TO_CART':
      Cart.insert({ productId: Action.productId });
      break;
    case 'PRODUCT_REMOVED_FROM_CART':
      Cart.remove(Action.id);
      break;
  }
});

let handle = Meteor.subscribe('cart');
State.modify('Cart.isReady', (state = false) => {
  return (!!handle && handle.ready());
});

State.modify('Cart.items', (state = []) => {
  switch (Action.type()) {
    case 'CART_FILTERED':
      return Cart.find({ category: Action.category });
    case 'CART_NOT_FILTERED':
      return Cart.find({});
    default:
      return state;
  }
});

State.modify('Category.items', (state = []) => {
  return Categories.find();
});

State.modify('Cart.selectedItem', (state = false) => {
  switch (Action.type()) {
    case 'PRODUCT_SELECTED':
      return Cart.findOne(Action.id);
    case 'CART_CLOSED':
      return false;
    default:
      return state;
  }
});

AfterAction(() => {
  if (Action.is('PRODUCT_SELECTED'))
    let productName = State.get('Cart.selectedItem.name');
    Analytics.track('User Selected Product', { productName });
});
```
HTML:
```html
{{#if Cart.isReady}}
  <div>Filter by category</div>
  <ul>
    <li>
      <a href="#" dispatch="CART_NOT_FILTERED">Remove filter</a>
    </li>
    {{#each Category.items}}
      <li>
        <a href="#" dispatch="CART_FILTERED" data-category={{name}}>{{name}}</a>
      </li>
    {{/each}}
  </ul>

  {{#each Cart.items}}
    <button dispatch="PRODUCT_SELECTED" data-id={{_id}}>Select</button>
    <div>{{name}}</div>
    <div>{{price}}</div>
  {{/each}}

  <div>
    {{#with Cart.selectedItem}}
      <div>{{name}}</div>
      <button dispatch="PRODUCT_REMOVED_FROM_CART" data-id={{_id}}>Remove</button>
    {{else}}
      No product selected...
    {{/with}}
  </div>
{{else}}
  <div>Loading...</div>
{{/if}}
```

For most of the things you don't need helpers or events.

## Other utils

### Dispatch(...).then(type, payload)

You can use `Dispatch().then()` when you want to queue **Actions**:

```javascript
Dispatch('SOMETHING_HAPPENED', { data: 'some data' })
   .then('OTHER_THING_HAPPENED', { otherData: 'some other data'});
```

### Dispatch.filter(function)

You can use `Dispatch.filter()` to evaluate the payload before the **Action** begins. This is useful if you need to redirect from one action to another.

```javascript
Dispatch.filter(function(payload) {
  if ((payload.type === 'SHOW_HOME_SCREEN') && (!Meteor.userId())) {
    payload.type === 'SHOW_LOGIN_SCREEN';
  }
  return payload;
});
```

If the function returns false, the **Action** dispatch is canceled.


## Async Operations

The **one way data flow** of **Flux** is designed to be synchronous. If we want to use async operations we must create an **Action Creator** like this:

```javascript
UserLogIn = function(user, password){
    Meteor.loginWithPassword(user, password, function(error){
      if (error) {
        Dispatch('LOGIN_FAILED');
      } else {
        Dispatch('LOGIN_SUCCEED');
      }
    });
  }
};
```

And dispatch the **Action** in your template like this:

```javascript
Template.LoginForm.events({
  'submit #login-form': function(event){
    event.preventDefault();
    var user = event.target.user.value;
    var password = event.target.password.value;
    UserLogIn(user, password);
  }
});
```

That way, **Stores** can listen to the `LOGIN_FAILED` and `LOGIN_SUCCEED` events and act accordingly.

## Debugging

Knowing what's happening in **Flux** is important. This framework comes with default console messages each time an **Action** is dispatched. They are `debugOnly` so don't worry, it won't happen in your app once it is on production.

# Changelog

### 1.1.10

- Update to ReactiveState 1.3.5

### 1.1.9

- Update to ReactiveState 1.3.4

### 1.1.8

- Update to ReactiveState 1.3.3

### 1.1.7

- Update to ReactiveState 1.3.1

### 1.1.4

- Update to ReactiveState 1.3.0

### 1.1.3

- Update to ReactiveState 1.2.1

### 1.1.2

- Fix blaze self.dispatch bug

### 1.1.1

- Add templating package

### 1.1.0

- Add Blaze Events
- Add console debug (development only)
- Add Travis badge

### 1.0.1

- Update ReactiveState to 1.2.0

### 1.0.0

- First release!

# License

MeteorFlux is licensed under the MIT License

Please check the LICENSE.txt file of https://github.com/worona/meteorflux
