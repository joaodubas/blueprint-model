'use strict';
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

        expect(function () { thrower(null) }).to.throw(TypeError);
        expect(function () { thrower('a') }).to.throw(TypeError);
        expect(function () { thrower(11) }).to.throw(TypeError);
        expect(function () { thrower(10) }).to.not.throw(TypeError);
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

        expect(function () { thrower(null) }).to.throw(TypeError);
        expect(function () { thrower('a') }).to.throw(TypeError);
        expect(function () { thrower(9) }).to.throw(TypeError);
        expect(function () { thrower(20) }).to.throw(TypeError);
        expect(function () { thrower(11) }).to.not.throw(TypeError);
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

        expect(function () { thrower(null) }).to.not.throw(TypeError);
        expect(function () { thrower('a') }).to.throw(TypeError);
        expect(function () { thrower(11) }).to.throw(TypeError);
        expect(function () { thrower(10) }).to.not.throw(TypeError);
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

        expect(function () { thrower(null) }).to.throw(TypeError);
        expect(function () { thrower('a') }).to.throw(TypeError);
        expect(function () { thrower(11) }).to.throw(TypeError);
        expect(function () { thrower(10) }).to.not.throw(TypeError);
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

        expect(function () { thrower(null) }).to.not.throw(TypeError);
        expect(function () { thrower('a') }).to.throw(TypeError);
        expect(function () { thrower(11) }).to.throw(TypeError);
        expect(function () { thrower(10) }).to.not.throw(TypeError);
      });
    });

    describe('number', function () {
      let properties = [
        { name: 'property', type: 'number', required: false }
      ];
      let User = model.createModel(modelName, properties);

      it('validate number field', function () {
        expect(function () {
          let user = new User();
          user.property = 'a';
        }).to.throw(TypeError);
      });
    });
  });
});
