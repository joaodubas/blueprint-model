'use strict';
/* jshint expr: true */
/* global describe, it */
const expect = require('chai').expect;
const model = require('../lib/model.js');

describe('model', function () {
  let modelName = 'User';
  let namedProperties = ['name', 'email', 'password'];
  let descriptorProperties = [
    {name: 'name'},
    {name: 'email'},
    {name: 'password'}
  ];

  describe('#createModel', function () {
    it('throw error if no model name is provided', function () {
      expect(function () { model.createModel(); }).to.throw(TypeError);
    });

    it('create an empty model', function () {
      let User = model.createModel(modelName);
      expect(User).to.be.a('function');
      expect(User.modelName).to.be.equal(modelName);
      expect(Object.keys(User.prototype)).to.be.empty;
    });

    it('create model with an array of named properties', function () {
      let User = model.createModel(modelName, namedProperties);
      namedProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key);
      });
    });

    it('create model with an array of descriptor properties', function () {
      let User = model.createModel(modelName, descriptorProperties);
      descriptorProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key.name);
      });
    });

    it('throw error if properties aren`t an array', function () {
      expect(function () {
        model.createModel(modelName, namedProperties[0]);
      }).to.throw(TypeError);
    });
  });

  describe('append properties', function () {
    it('named properties', function () {
      let User = model.createModel(modelName);

      namedProperties.forEach(function (key) {
        User.setProperty(key);
      });

      namedProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key);
      });
    });

    it('descriptor properties', function () {
      let User = model.createModel(modelName);

      descriptorProperties.forEach(function (key) {
        User.setProperty(key);
      });

      descriptorProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key.name);
      });
    });

    it('named properties all at once', function () {
      let User = model.createModel(modelName);

      User.setProperties(namedProperties);

      namedProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key);
      });
    });

    it('descriptor properties all at once', function () {
      let User = model.createModel(modelName);

      User.setProperties(descriptorProperties);

      descriptorProperties.forEach(function (key) {
        expect(User.prototype).to.have.ownProperty(key.name);
      });
    });

    it('in a chain', function () {
      function create() {
        let User = model.createModel(modelName);
        User
          .setProperty('name')
          .setProperty('email')
          .setProperty('password');
        return User;
      }

      expect(create).to.not.throw(Error);
      expect(create().prototype).to.have.keys(['name', 'email', 'password']);
    });

    it('in a list', function () {
      let properties = ['name', 'email', 'password'];

      function create() {
        let User = model.createModel(modelName);
        User.setProperties(properties);
        return User;
      }

      expect(create).to.not.throw(Error);
      expect(create().prototype).to.have.keys(properties);
    });

    it('invalid property should throw error', function () {
      let property = [{names: 'property'}];
      expect(function () {
        let User = model.createModel(modelName, property);
      }).to.throw(TypeError);
    });
  });

  describe('validation', function () {
    describe('required', function () {
      it('validate required field', function () {
        let properties = [{ name: 'property', required: true }];
        let User = model.createModel(modelName, properties);
        expect(function () {
          let user = new User();
          user.property = null;
        }).to.throw(TypeError);
      });

      it('do not validate unrequired field', function () {
        let properties = [{ name: 'diff_property', required: false }];
        let User = model.createModel(modelName, properties);
        expect(function () {
          let user = new User();
          user.diff_property = null;
        }).to.not.throw(TypeError); 
      });
    });

    describe('typed', function () {
      it('validate required and typed field', function () {
        let properties = [
          { name: 'property', required: true, type: 'number' }
        ];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(1); }).to.not.throw(TypeError);
      });

      it('validate unreqired and typed field when value not null', function () {
        let properties = [
          { name: 'property', required: false, type: 'number' }
        ];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.not.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(1); }).to.not.throw(TypeError);
      });

      describe('types', function () {
        var properties = [
          {name: 'pNum', type: 'number', required: false},
          {name: 'pStr', type: 'string', required: false},
          {name: 'pDate', type: 'date', required: false},
          {name: 'pBool', type: 'boolean', required: false}
        ];
        var User = model.createModel('User', properties);
        function thrower(property, value) {
          var user = new User();
          user[property] = value;
        }

        it('ensure number', function () {
          expect(function () { thrower('pNum', 'a'); }).to.throw(TypeError);
          expect(function () { thrower('pNum', 1); }).to.not.throw(TypeError);
        });

        it('ensure string', function () {
          expect(function () { thrower('pStr', true); }).to.throw(TypeError);
          expect(function () { thrower('pStr', 'a'); }).to.not.throw(TypeError);
        });

        it('ensure date', function () {
          expect(function () { thrower('pDate', true); }).to.throw(TypeError);
          expect(function () { thrower('pDate', new Date()); }).to.not.throw(TypeError);
        });

        it('ensure boolean', function () {
          expect(function () { thrower('pBool', 1); }).to.throw(TypeError);
          expect(function () { thrower('pBool', true); }).to.not.throw(TypeError);
        });
      });
    });

    describe('custom validators', function () {
      it('accepts apply them', function () {
        let properties = [{
          name: 'property',
          required: true,
          type: 'number',
          validators: [{
            fn: function (value) { return value <= 10; },
            message: 'You must set a number lower than or equal to 10.'
          }]
        }];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(11); }).to.throw(TypeError);
        expect(function () { thrower(10); }).to.not.throw(TypeError);
      });

      it('must be an array', function () {
        let properties = [{
          name: 'property',
          requried: true,
          type: 'number',
          validators: {
            fn: function (value) { return true; },
            message: 'NoOp'
          }
        }];
        
        expect(
          function () { let User = model.createModel(modelName, properties); }
        ).to.throw(TypeError);
      });

      it('can be multiple', function () {
        let properties = [{
          name: 'property',
          required: true,
          type: 'number',
          validators: [
            {
              fn: function (value) { return value >= 10; },
              message: 'You must set a number greater than or equal to 10.'
            },
            {
              fn: function (value) { return value < 20; },
              message: 'You must set a number lower than 20.'
            },
          ]
        }];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(9); }).to.throw(TypeError);
        expect(function () { thrower(20); }).to.throw(TypeError);
        expect(function () { thrower(11); }).to.not.throw(TypeError);
      });

      it('can be used without required', function () {
        let properties = [{
          name: 'property',
          type: 'number',
          validators: [{
            fn: function (value) { return value <= 10; },
            message: 'You must set a number lower than or equal to 10.'
          }]
        }];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.not.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(11); }).to.throw(TypeError);
        expect(function () { thrower(10); }).to.not.throw(TypeError);
      });

      it('can be used without a type', function () {
        let properties = [{
          name: 'property',
          required: true,
          validators: [{
            fn: function (value) { return value <= 10; },
            message: 'You must set a number lower than or equal to 10.'
          }]
        }];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(11); }).to.throw(TypeError);
        expect(function () { thrower(10); }).to.not.throw(TypeError);
      });

      it('can be used without required and type', function () {
        let properties = [{
          name: 'property',
          validators: [{
            fn: function (value) { return value <= 10; },
            message: 'You must set a number lower than or equal to 10.'
          }]
        }];
        let User = model.createModel(modelName, properties);

        function thrower(value) {
          let user = new User();
          user.property = value;
        }

        expect(function () { thrower(null); }).to.not.throw(TypeError);
        expect(function () { thrower('a'); }).to.throw(TypeError);
        expect(function () { thrower(11); }).to.throw(TypeError);
        expect(function () { thrower(10); }).to.not.throw(TypeError);
      });
    });
  });

  describe('instance', function () {
    it('create without `new` keyword', function () {
      let User = model.createModel(modelName, ['name']);
      function creator() {
        return User();
      }

      expect(creator).to.not.throw(Error);
      expect(creator().constructor.name).to.be.equal(User.name);
      expect(creator().constructor.model).to.be.equal(User.model);
    });

    it('do not share property values', function () {
      let properties = ['name', 'email', 'password'];
      let User = model.createModel(modelName, properties);
      let aUser = new User();
      let otherUser = new User();

      expect(aUser.name).to.be.empty;
      expect(otherUser.name).to.be.empty;

      aUser.name = 'me';
      otherUser.name = 'it';
      expect(aUser.name).to.not.be.equal(otherUser.name);
    });

    it('receive values during initialization', function () {
      let attrs = {
        name: 'me',
        email: 'me@me.com',
        password: 'me'
      };
      let User = model.createModel(modelName, Object.keys(attrs));
      let user = new User(attrs);
      Object.keys(attrs).forEach(function (attr) {
        expect(user[attr]).to.be.equal(attrs[attr]);
      });
    });

    it('validate values during initialization', function () {
      let properties = [
        {
          name: 'name',
          required: true,
          type: 'string'
        },
        {
          name: 'email',
          required: false,
          type: 'string'
        },
        {
          name: 'password',
          required: true,
          type: 'string'
        }
      ];
      let User = model.createModel(modelName, properties);

      function thrower(attrs) {
        return function () {
          return new User(attrs);
        };
      }

      expect(
        thrower({name: 'me', email: null, password: 'me'})
      ).to.not.throw(TypeError);
      expect(
        thrower({name: 1, email: null, password: 'me'})
      ).to.throw(TypeError);
      expect(
        thrower({name: 'me', email: 1, password: 'me'})
      ).to.throw(TypeError);
      expect(
        thrower({name: 'me', email: 'me@me.com', password: null})
      ).to.throw(TypeError);
    });
  });

  describe('events', function () {
    describe('constructor', function () {
      it('emit construct after create an instance', function (done) {
        let properties = ['name', 'email', 'password'];
        let User = model.createModel(modelName, properties);
        let props = {'name': 'me', 'email': 'me@me.com', 'password': 'me'};

        User.on('construct', function(instance, attrs) {
          expect(instance.constructor.modelName).to.be.equal(User.modelName);
          expect(attrs).to.be.eql(props);
          done();
        });

        new User(props);
      });

      it('emit change when an attribute is set', function (done) {
        let props = {'name': 'me', 'email': 'me@me.com', 'password': 'me'};
        let User = model.createModel(modelName, Object.keys(props));
        let count = 0;
        let max_ = Object.keys(props).length;
        User.on('change', function (instance, attr, value) {
          expect(value).to.be.equal(props[attr]);
          count += 1;
          if (count === max_) done();
        });

        let user = new User();
        Object.keys(props).forEach(function (key) {
          user[key] = props[key];
        });
      });

      it('emit change <attr_name> when given attribute is set', function (done) {
        let props = {'name': 'me', 'email': 'me@me.com', 'password': 'me'};
        let User = model.createModel(modelName, Object.keys(props));
        let count = 0;
        let max_ = Object.keys(props).length;

        function assess(instance, value) {
          /* jshint validthis: true */
          expect(value).to.be.equal(props[this.attr]);
          count += 1;
          if (count === max_) done();
        }

        User.on('change name', assess.bind({attr: 'name'}));
        User.on('change email', assess.bind({attr: 'email'}));
        User.on('change password', assess.bind({attr: 'password'}));

        let user = new User();
        Object.keys(props).forEach(function (key) {
          user[key] = props[key];
        });
      });
    });

    describe('instance', function () {
      it('emit change when an attribute is set', function (done) {
        let props = {'name': 'me', 'email': 'me@me.com', 'password': 'me'};
        let User = model.createModel(modelName, Object.keys(props));
        let count = 0;
        let max_ = Object.keys(props).length;
        let user = new User();
        user.on('change', function (instance, attr, value) {
          expect(value).to.be.equal(props[attr]);
          count += 1;
          if (count === max_) done();
        });

        Object.keys(props).forEach(function (key) {
          user[key] = props[key];
        });
      });

      it('emit change <attr_name> when given attribute is set', function (done) {
        let props = {'name': 'me', 'email': 'me@me.com', 'password': 'me'};
        let User = model.createModel(modelName, Object.keys(props));
        let count = 0;
        let max_ = Object.keys(props).length;
        let user = new User();

        function assess(instance, value) {
          /* jshint validthis: true */
          expect(value).to.be.equal(props[this.attr]);
          count += 1;
          if (count === max_) done();
        }

        user.on('change name', assess.bind({attr: 'name'}));
        user.on('change email', assess.bind({attr: 'email'}));
        user.on('change password', assess.bind({attr: 'password'}));

        Object.keys(props).forEach(function (key) {
          user[key] = props[key];
        });
      });
    });
  });

  describe('plugin', function () {
    it('receives a Model constructor', function (done) {
      let User = model.createModel('User');
      function plugin(Model) {
        expect(Model.constructor.name).to.be.equal(User.constructor.name);
        expect(Model.modelName).to.be.equal(User.modelName);
        done();
      }
      User.use(plugin);
    });
  });
});
