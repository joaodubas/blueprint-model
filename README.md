# blueprint-model

[![Build Status][travis-build-status]][travis-build]
[![Coverage Status][coverage-build-status]][coverage-build]

Database agnostic data modeller. Somewhat inspired by the [model
component][component-model] made by [TJ Holowaychuck][git-visionmedia].

## API

### model#createMolde(name, [properties])

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
  throw `TypeError` if a `value` is passed to the property,
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
        name: password,
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

[travis-build-status]: https://travis-ci.org/joaodubas/blueprint-model.png?branch=master
[travis-build]: https://travis-ci.org/joaodubas/blueprint-model
[coverage-build-status]: https://coveralls.io/repos/joaodubas/blueprint-model/badge.png?branch=master
[coverage-build]: https://coveralls.io/r/joaodubas/blueprint-model?branch=master
[component-model]: https://github.com/component/model
[git-visionmedia]: https://github.com/visionmedia
