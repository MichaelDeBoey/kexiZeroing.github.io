---
title: "JavaScript prototype chain, Class and Proxy"
description: ""
added: "Aug 4 2020"
tags: [js]
updatedDate: "Aug 4 2024"
---

## The prototype chain
JavaScript is a bit confusing for developers experienced in class-based languages like Java or C++, as it is dynamic and does not provide a class implementation (the `class` keyword is introduced in ES2015, but is syntactical sugar, JavaScript remains prototype-based).

Each JavaScript object has a private property which holds a link to another object called its **prototype**. That prototype object has a prototype of its own, and so on until an object is reached with `null` as its prototype. By definition, `null` has no prototype, and acts as the final link in this prototype chain.

When trying to access a property of an object, the property will not only be sought on the object but on the prototype of the object, the prototype of the prototype, and so on until either a property with a matching name is found or the end of the prototype chain is reached.

Following the ECMAScript standard, the notation `someObject.[[Prototype]]` is used to designate the prototype of `someObject`. **Since ECMAScript 2015, the `[[Prototype]]` is accessed using the accessors `Object.getPrototypeOf()` and `Object.setPrototypeOf()`. This is equivalent to the JavaScript property `__proto__` which is non-standard but implemented by many browsers**. It should not be confused with the `func.prototype` property of functions, which specifies the `[[Prototype]]` to be assigned to all instances of objects created by the given function when used as a constructor. The reference to the prototype object is copied to the internal `[[Prototype]]` property of the new instance.

- All functions have a special property named `prototype`, but there is one exception that arrow function doesn't have a default prototype property. 
- The native prototypes should never be extended unless it is for the sake of compatibility with newer JavaScript features.
- Changing the `[[Prototype]]` of an object is a very slow operation in JavaScript engines, so you should avoid setting the `[[Prototype]]` of an object by using `Object.setPrototypeOf()`. Instead, create a new object with the desired `[[Prototype]]` using `Object.create()`.
- To check whether an object has a property defined on itself and not somewhere on its prototype chain, it is necessary to use the `Object.prototype.hasOwnProperty()` method.

```js
// when you call
var o = new Foo();

// JavaScript actually just does
var o = new Object();
o.[[Prototype]] = Foo.prototype;
Foo.call(o);

// create an object
let f = function () {
  this.a = 1;
  this.b = 2;
}
let o = new f();

f.prototype.b = 3;
f.prototype.c = 4;

// do not set f.prototype = {b:3, c:4}; this will break the prototype chain
// o.[[Prototype]] has properties b and c.
// o.[[Prototype]].[[Prototype]] is Object.prototype.
// Finally, o.[[Prototype]].[[Prototype]].[[Prototype]] is null.
// This is the end of the prototype chain.

// The prototype also has a 'b' property, but it's not visited. 
// This is called Property Shadowing.

var o = {
  a: 2,
  m: function() {
    return this.a + 1;
  }
};

// p is an object whose prototype is o
var p = Object.create(o);
p.a = 4;
console.log(p.m()); // 5

var b = Object.create(a);
// b ---> a ---> Object.prototype ---> null
var c = Object.create(null);
// c ---> null

// should-be-deprecated and ill-performant
Object.setPrototypeOf(d, foo.prototype);
```

```js
function Animal (name) {
  let animal = {}
  animal.name = name

  return animal
}

Animal.prototype.eat = ...
const leo = Animal('Leo')
leo.eat() // fail, the returned object isn’t delegating to Animal.prototype

// should be
function Animal (name) {
  let animal = Object.create(Animal.prototype)
  animal.name = name

  return animal
}

// or
function Animal (name) {
  this.name = name
}
const leo = new Animal('Leo')
```

## Classes
JavaScript classes are primarily syntactical sugar over existing prototype-based inheritance. The class syntax does not introduce a new object-oriented model to JavaScript. **The body of a class is executed in strict mode**.

Classes are in fact "special functions", and just as you can define function expressions and function declarations, the class syntax also includes class expressions and class declarations. An important difference between function declarations and class declarations is that function declarations are hoisted and class declarations are not.

The constructor method is a special method for creating and initializing an object created with a class. There can only be one special method with the name "constructor" in a class. If you do not specify a constructor method, a default constructor is used. JavaScript doesn’t allow class constructors to be `async`, so we have to do any async actions outside of a constructor.

```js
// class declaration
class Rectangle {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
}

// class expression
let Rectangle = class {
  constructor(height, width) {
    this.height = height;
    this.width = width;
  }
};

// methods defined within the class body are added to the prototype
var rect = new Rectangle(1,1);
rect.constructor === Rectangle.prototype.constructor  // true
Object.getPrototypeOf(rect)  // { constructor: class Rectangle }

// class methods
class Animal {
  eat() {}
  sleep = () => {}
}

// Is equivalent to
function Animal () {
  this.sleep = function () {}
}
Animal.prototype.eat = function () {}
```

### Class field
It will allow you to add instance properties directly as a property on the class without having to use the constructor method. Class properties are public by default. Sometimes when you’re building a class, you want to have private values that aren’t exposed to the outside world. Historically because we’ve lacked the ability to have truly private values, we’ve marked them with an underscore (but it is only a convention). According to the new proposal, you can create a private field using a hash # prefix. It is a syntax error to refer to # names from outside of the class. JavaScript is able to perform this compile-time check because of the special hash identifier syntax, making it different from normal properties on the syntax level.

> Note that code run in the Chrome console can access private properties outside the class. This is a DevTools-only relaxation of the JavaScript syntax restriction.

```js
class A {
  name = 'abc'
}
// is equivalent to
class A {
  constructor() {
    this.name = 'abc'
  }
}

class Car {
  // private field, # as a part of the property name
  #milesDriven = 0  
  
  drive(distance) {
    this.#milesDriven += distance
  }
  getMilesDriven() {
    return this.#milesDriven
  }
}

const tesla = new Car()
tesla.drive(10)
tesla.getMilesDriven() // 10
tesla.#milesDriven     // Invalid
```

### Class static fields
Public static fields are useful when you want a field to exist only once per class, not on every class instance you create. Static methods aren't called on instances of the class. Instead, they're called on the class itself. 

Static methods are not directly accessible using `this` keyword from non-static methods. You need to call them using the class name: `CLASSNAME.STATIC_METHOD_NAME()` or by calling the method as a property of the constructor: `this.constructor.STATIC_METHOD_NAME()`.

```js
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.value = Math.random();
    Singleton.instance = this;
    return this;
  }

  getValue() {
    return this.value;
  }
}
```

```js
class ClassWithStaticField {
  static staticField = 'static field';

  constructor() {
    console.log(ClassWithStaticField.staticMethod()); 
    console.log(this.constructor.staticMethod()); 
  }
  
  static staticMethod() {
    return 'Static method has been called';
  }

  static anotherStaticMethod() {
    return this.staticMethod() + ' from another static method';
  }
}

console.log(ClassWithStaticField.staticField);
ClassWithStaticField.staticMethod(); 
```

```js
class LogLevel {
  static Debug = 0;
  static Info = 1;
  static Warn = 2;
  static Error = 3;
  static Critical = 4;

  static assert(log_level) {
    if (![LogLevel.Debug, LogLevel.Info, LogLevel.Warn, LogLevel.Error, LogLevel.Critical].includes(log_level)) {
      throw new Error(`log_level must be an instance of LogLevel. Unsupported param ${JSON.stringify(log_level)}`);
    }
  }
}
```

### Class getter and setter
Add methods prefixed with `get` or `set` to create a getter and setter, which are executed based on what you are doing: accessing the variable, or modifying its value. If you only have a getter, the property cannot be set; If you only have a setter, you can change the value but not access it.

```js
class Circle {
  constructor (radius) {
    this.radius = radius;
  }

  calcArea() {
    return Math.PI * this.radius * this.radius;
  }
 
  get area() {
    return this.calcArea();
  }

  set area(n) {
    this.radius = Math.sqrt(n / Math.PI);
  }
}

const circle = new Circle(10);
console.log(circle.area);
```

### Class inheritance
A class can extend another class or extend traditional function-based "classes". The `super` keyword is used to reference the parent class. **Private fields are not inherited by subclasses.** To fix this, you can add a getter method to the parent class that returns the value of the private field.

```js
class Square extends Polygon {
  constructor(length) {
    // calls parent class constructor
    super(length);
    this.name = 'Square';
  }

  hello() {
    return super.hello() + ' I am a square.'
  }
}

Object.getPrototypeOf(Square.prototype) === Polygon.prototype;  // true

// In derived classes, super() must be called before you can use 'this'
class A {}
class B extends A {
  constructor() {
    super();
    console.log(this);  // B {}
  }
}
class C extends A {
  constructor() {
    console.log(this);  // ReferenceError
  }
}
```

### new.target
It lets you detect whether a function or constructor was called using the `new` operator. Normally the left-hand side of the dot is the object on which property access is performed, but here `new` is not an object. **If constructors and functions invoked using the `new` operator, `new.target` returns a reference to the constructor or function. In normal function calls, `new.target` is undefined.** In arrow functions, `new.target` is inherited from the surrounding scope.

```js
function Foo() {
  if (!new.target) throw 'Foo() must be called with new';
  console.log('Foo instantiated with new');
}

new Foo();  // "Foo instantiated with new"
Foo();  // throws "Foo() must be called with new"

// new.target refers to the constructor that was directly invoked by new
class A {
  constructor() { console.log(new.target.name); }
}
class B extends A { 
  constructor() { super(); } 
}

const a = new A();  // logs "A"
const b = new B();  // logs "B"
```

## Proxy and Reflect
The **Proxy** object enables you to create a proxy for another object, which can intercept and redefine fundamental operations for that object. Proxy objects are commonly used to log property accesses, validate, format, or sanitize inputs, and so on.

Handler functions are sometimes called traps, because they trap calls to the underlying target object. *A trap is used to intercept an operation on an object — it provides a custom implementation for an object internal method.* It's important to realize that all interactions with an object eventually boils down to the invocation of one of these internal methods, and that they are all customizable through proxies.

| Internal Method       | Corresponding Trap          |
|-----------------------|-----------------------------|
| [[GetPrototypeOf]]    | getPrototypeOf()            |
| [[SetPrototypeOf]]    | setPrototypeOf()            |
| [[IsExtensible]]      | isExtensible()              |
| [[PreventExtensions]] | preventExtensions()         |
| [[GetOwnProperty]]    | getOwnPropertyDescriptor()  |
| [[DefineOwnProperty]] | defineProperty()            |
| [[HasProperty]]       | has()                       |
| [[Get]]               | get()                       |
| [[Set]]               | set()                       |
| [[Delete]]            | deleteProperty()            |
| [[OwnPropertyKeys]]   | ownKeys()                   |
| [[Call]]              | apply()                     |
| [[Construct]]         | construct()                 |

```js
// The target object can be any sort of object,
// including a native array, a function, or even another proxy.
const p = new Proxy(
  {},
  {
    ownKeys(target) {
      console.log("called");
      return ["a", "b", "c"];
    },
    has(target, prop) {
      console.log(`called: ${prop}`);
      return true;
    },
  },
);

console.log(Object.getOwnPropertyNames(p));
// "called"
// [ 'a', 'b', 'c' ]
console.log("a" in p);
// "called: a"
// true
```

The **Reflect** namespace object contains static methods for invoking interceptable JavaScript object internal methods. The methods are the same as those of proxy handlers. Unlike most global objects, Reflect is not a constructor. You cannot use it with the `new` operator or invoke the Reflect object as a function. All properties and methods of Reflect are static.

The major use case of Reflect is to provide default forwarding behavior in Proxy handler traps. The Reflect API is used to invoke the corresponding internal method. For example, you create a proxy with a `deleteProperty` trap that intercepts the `[[Delete]]` internal method. `Reflect.deleteProperty()` is used to invoke the default `[[Delete]]` behavior on targetObject directly. You can replace it with `delete`, but using Reflect saves you from having to remember the syntax that each internal method corresponds to.

```js
const person = {
  name: "John Doe",
  age: 42,
};

const personProxy = new Proxy(person, {
  get: (obj, prop) => {
    console.log(`The value of ${prop} is ${Reflect.get(obj, prop)}`);
  },
  set: (obj, prop, value) => {
    console.log(`Changed ${prop} from ${obj[prop]} to ${value}`);
    Reflect.set(obj, prop, value);
  },
  deleteProperty(obj, prop) {
    console.log("Deleting property:", prop);
    return Reflect.deleteProperty(obj, prop);
  },
});
```
