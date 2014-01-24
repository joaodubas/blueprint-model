# blueprint-model

[![Build Status][travis-build-status]][travis-build]
[![Coverage Status][coverage-build-status]][coverage-build]

[![browser support][testling-build-status]][testling-build]

Database agnostic data modeller. Somewhat inspired by the [model
component][component-model] made by [TJ Holowaychuck][git-visionmedia].

## Usage and installation

To install the package use:

```shell
$ npm install blueprint-model
```

The package is tested to run in [node at least 0.8.x][travis-build].

## API

### model#createModel(name, [properties])

Create a new model with the given name and optional properties.

```javascript
var model = require('blueprint-model');
var User = model.createModel('User');
```

With properties set during creation:

```javascript
var model = require('blueprint-model');
var User = model.createModel('User', ['username', 'email', 'password']);
```

### .setProperties(properties)

Add a list of properties to the model.

```javascript
var model = require('blueprint-model');
var User = model.createModel('User');
User.setProperties(['username', 'email', 'password']);
```

### .setProperty(property)

Add a property to the model.

```javascript
var model = require('blueprint-model');
var User = model.createModel('User');
User
    .setProperty('username')
    .setProperty('email')
    .setProperty('password');
```

#### Property descriptor

A property can be a string, as showed before, or a descriptor, that allows you
to add meta information about the property.

The descriptor is an `object` with the following keys:

* `name`: indicate the property name,
* `required`: boolean indicating if the property is required, if `true` will
  throw `TypeError` if a `null` or `undefined` value is passed to the property,
* `type`: indicate the property type, ensuring that you can only set the
  aproppriate value for the property, will throw `TypeError` if an invalid
  value is assigned to the property. For the moment the following types are
  available:
    * `string`
    * `number`
    * `boolean`
    * `date`
* `validators`: accepts an array of `object`s containing an `fn` (function that
  receives a value and returns a `boolean` indicating if the value is valid or
  not) and a `message` that will be show in case the value isn't valid.

```javascript
var model = require('blueprint-model');
var properties = [
    {
        name: 'username',
        required: true,
        type: 'string',
        validators: [
            {
                fn: function (value) { return value.length >= 30; },
                message: 'Set a value with at least 30 chars for '
            }
        ]
    },
    {
        name: 'email',
        required: false,
        type: 'string'
    },
    {
        name: 'password',
        requried: true,
        type: 'string',
        validators: [
            {
                fn: function (value) { return value.length >= 8 },
                message: 'Set a value with at least 8 chars for '
            }
        ]
    }
];
var User = model.createModel('User', properties);
```

### .use(function)

Allow to extend the model with custom behavior through a function.

```javascript
var model = require('blueprint-model');
var User = model.create('User');
User
    .setProperty('username')
    .setProperty('email')
    .setProperty('password')
    .use(function (Model) {
        function logger() {
            console.log('action => ', arguments.join(' : ');
        }
        Model.on('construct', logger);
        Model.on('change', logger);
    });
```

## Events

### Constructor

#### `construct`

Emitted after an instance is created with attributes set in the constructor.

```javascript
var User = model.createModel('User', ['username']);
User.on('construct', function (instance, attrs) {
    console.log(instance.model.modelName);
    console.log(Object.keys(attrs));
});
var instance = new User({username: 'me'});
```

#### `change`

Emitted after any property is set or changed.

```javascript
var User = mode.createModel('User', ['username', 'email']);
User.on('change', function (instance, attr, value) {
    console.log(instance.model.modelName, attr, value);
});
var instance = new User({username: 'me'});
instance.email = 'me@me.com';
```

#### `change <property>`

Emitted after the a given property is set or changed.

```javascript
var User = mode.createModel('User', ['username', 'email']);
User.on('change email', function (instance, attr, value) {
    console.log(instance.model.modelName, attr, value);
});
var instance = new User({username: 'me'});
instance.email = 'me@me.com';
```

### Instance

#### `change`

Emitted after any property is set or changed.

```javascript
var User = mode.createModel('User', ['username', 'email']);
var instance = new User({username: 'me'});
instance.on('change', function (instance, attr, value) {
    console.log(instance.model.modelName, attr, value);
});
instance.email = 'me@me.com';
```

#### `change <property>`

Emitted after the a given property is set or changed.

```javascript
var User = mode.createModel('User', ['username', 'email']);
var instance = new User({username: 'me'});
instance.on('change email', function (instance, attr, value) {
    console.log(instance.model.modelName, attr, value);
});
instance.email = 'me@me.com';
```

[travis-build-status]: https://travis-ci.org/joaodubas/blueprint-model.png?branch=master
[travis-build]: https://travis-ci.org/joaodubas/blueprint-model
[coverage-build-status]: https://coveralls.io/repos/joaodubas/blueprint-model/badge.png?branch=master
[coverage-build]: https://coveralls.io/r/joaodubas/blueprint-model?branch=master
[testling-build-status]: https://ci.testling.com/joaodubas/blueprint-model.png
[testling-build]: https://ci.testling.com/joaodubas/blueprint-model
[component-model]: https://github.com/component/model
[git-visionmedia]: https://github.com/visionmedia
