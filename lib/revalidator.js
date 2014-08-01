(function (exports) {
  exports.validate = validate;
  exports.mixin = mixin;

  //
  // ### function validate (object, schema, options)
  // #### {Object} object the object to validate.
  // #### {Object} schema (optional) the JSON Schema to validate against.
  // #### {Object} options (optional) options controlling the validation
  //      process. See {@link #validate.defaults) for details.
  //
  // AdColony specific revalidator. Adding capability for translating messages
  // through an i18next translation dictionary. Schema is extended with a
  // property 'i18nKey' which specifies the root object to look for translations
  // for. After that, structure is 'property'.'attribute', so full key will look like
  // 'i18nKey.property.attribute'
  //
  // Validate <code>object</code> against a JSON Schema.
  // If <code>object</code> is self-describing (i.e. has a
  // <code>$schema</code> property), it will also be validated
  // against the referenced schema. [TODO]: This behaviour bay be
  // suppressed by setting the {@link #validate.options.???}
  // option to <code>???</code>.[/TODO]
  //
  // If <code>schema</code> is not specified, and <code>object</code>
  // is not self-describing, validation always passes.
  //
  // <strong>Note:</strong> in order to pass options but no schema,
  // <code>schema</code> <em>must</em> be specified in the call to
  // <code>validate()</code>; otherwise, <code>options</code> will
  // be interpreted as the schema. <code>schema</code> may be passed
  // as <code>null</code>, <code>undefined</code>, or the empty object
  // (<code>{}</code>) in this case.
  //
  function validate(object, schema, options) {
    options = mixin({}, options, validate.defaults);
    var errors = [];

    validateObject(object, schema, options, errors);

    //
    // TODO: self-described validation
    // if (! options.selfDescribing) { ... }
    //

    return {
      valid: !(errors.length),
      errors: errors
    };
  };

  /**
   * Default validation options. Defaults can be overridden by
   * passing an 'options' hash to {@link #validate}. They can
   * also be set globally be changing the values in
   * <code>validate.defaults</code> directly.
   */
  validate.defaults = {
    /**
     * <p>
     * Enforce 'format' constraints.
     * </p><p>
     * <em>Default: <code>true</code></em>
     * </p>
     */
    validateFormats: true,
    /**
     * <p>
     * When {@link #validateFormats} is <code>true</code>,
     * treat unrecognized formats as validation errors.
     * </p><p>
     * <em>Default: <code>false</code></em>
     * </p>
     *
     * @see validation.formats for default supported formats.
     */
    validateFormatsStrict: false,
    /**
     * <p>
     * When {@link #validateFormats} is <code>true</code>,
     * also validate formats defined in {@link #validate.formatExtensions}.
     * </p><p>
     * <em>Default: <code>true</code></em>
     * </p>
     */
    validateFormatExtensions: true,
    /**
     * <p>
     * Given an i18next object (which supports the 't'ranslate function),
     * apply for custom messages. Default name space of 'validation_translation'.
     * <p>
     */
  };

  /**
   * Default messages to include with validation errors.
   */
  validate.messages = {
required:         "is required",
minLength:        "is too short (minimum is %{expected} characters)",
maxLength:        "is too long (maximum is %{expected} characters)",
pattern:          "invalid input",
minimum:          "must be greater than or equal to %{expected}",
maximum:          "must be less than or equal to %{expected}",
exclusiveMinimum: "must be greater than %{expected}",
exclusiveMaximum: "must be less than %{expected}",
divisibleBy:      "must be divisible by %{expected}",
minItems:         "must contain more than %{expected} items",
maxItems:         "must contain less than %{expected} items",
uniqueItems:      "must hold a unique set of values",
format:           "is not a valid %{expected}",
conform:          "must conform to given constraint",
type:             "must be of %{expected} type",
equal:            "must be the same as %{expected}"
  };
  validate.messages['enum'] = "must be present in given enumerator";

  /**
   *
   */
  validate.formats = {
    'email':          /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
    'ip-address':     /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i,
    'ipv6':           /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/,
    // http://stackoverflow.com/questions/12756159/regex-and-iso8601-formated-datetime
    'date-time':      /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/,
    'date':           /^\d{4}-\d{2}-\d{2}$/,
    'time':           /^\d{2}:\d{2}:\d{2}$/,
    'color':          /^#[a-z0-9]{6}|#[a-z0-9]{3}|(?:rgb\(\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*,\s*(?:[+-]?\d+%?)\s*\))aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|and yellow$/i,
    //'style':        (not supported)
    //'phone':        (not supported)
    //'uri':          (not supported)
    'host-name':      /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])/,
    'utc-millisec':   {
      test: function (value) {
        return typeof(value) === 'number' && value >= 0;
      }
    },
    'regex':          {
      test: function (value) {
        try { new RegExp(value) }
        catch (e) { return false }

        return true;
      }
    }
  };

  /**
   *
   */
  validate.formatExtensions = {
    'url': /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:(\/|\?)[^\s]*)?$/,
    'android_url': /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.‌​\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[‌​6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1‌​,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00‌​a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u‌​00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:(\/|\?)[^\s]*)?$|^market:\/\//
  };

  validate.keywords = Object.keys(validate.messages).concat(['description', 'items', 'message', 'messages', 'admin_only', 'dependencies', 'i18nContext']);

  function mixin(obj) {
    var sources = Array.prototype.slice.call(arguments, 1);
    while (sources.length) {
      var source = sources.shift();
      if (!source) { continue }

      if (typeof(source) !== 'object') {
        throw new TypeError('mixin non-object');
      }

      for (var p in source) {
        if (source.hasOwnProperty(p)) {
          obj[p] = source[p];
        }
      }
    }

    return obj;
  };

  function validateObject(object, schema, options, errors) {
    var props, allProps = Object.keys(object),
      visitedProps = [];

    // see 5.2
    if (schema.properties) {
      props = schema.properties;
      for (var p in props) {
        if (props.hasOwnProperty(p)) {
          visitedProps.push(p);
          validateProperty(object, object[p], p, props[p], options, errors, schema.i18nKey);
        }
      }
    }

    // see 5.3
    if (schema.patternProperties) {
      props = schema.patternProperties;
      for (var p in props) {
        if (props.hasOwnProperty(p)) {
          var re = new RegExp(p);

          // Find all object properties that are matching `re`
          for (var k in object) {
            if (object.hasOwnProperty(k)) {
              visitedProps.push(k);
              if (re.exec(k) !== null) {
                validateProperty(object, object[k], p, props[p], options, errors, i18nKey);
              }
            }
          }
        }
      }
    }

    // see 5.4
    if (undefined !== schema.additionalProperties) {
      var i, l;

      var unvisitedProps = allProps.filter(function(k){
        return -1 === visitedProps.indexOf(k);
      });

      // Prevent additional properties; each unvisited property is therefore an error
      if (schema.additionalProperties === false && unvisitedProps.length > 0) {
        for (i = 0, l = unvisitedProps.length; i < l; i++) {
          error("additionalProperties", unvisitedProps[i], object[unvisitedProps[i]], false, errors);
        }
      }
      // additionalProperties is a schema and validate unvisited properties against that schema
      else if (typeof schema.additionalProperties == "object" && unvisitedProps.length > 0) {
        for (i = 0, l = unvisitedProps.length; i < l; i++) {
          validateProperty(object, object[unvisitedProps[i]], unvisitedProps[i], schema.unvisitedProperties, options, errors, i18nKey);
        }
      }
    }

  };

  function schemaHasType(schema, type) {
      if( isArray(schema.type) ){
          return schema.type.indexOf(type) > -1;
      } else {
          return schema.type === type;
      }
  }

    /**
     * Cast the value to a type
     * Also needs to support array types, though behaviour is undefined when a value overlaps multiple types
     * eg. type = ['boolean', 'number'], value = '0' may return either false or 0
     * @param value
     * @param schema
     * @returns {*}
     */
  function cast(value, schema) {
    // If the value can be null, and it is null
    if (schemaHasType(schema, 'null') && value == null){
        return null;
    }
    if ((schemaHasType(schema, 'integer') || schemaHasType(schema, 'number')) && value == +value) {
      value = +value;
    }

    if (schemaHasType(schema, 'boolean')){
      if ('true' === value || '1' === value || 1 === value) {
        value = true;
      }

      if ('false' === value || '0' === value || 0 === value) {
        value = false;
      }
    }
    return value;
  };

  function validateProperty(object, value, property, schema, options, errors, i18nKey) {
    var format,
      valid,
      spec,
      type,
      error;

    error = generateErrorFunction(options.i18n, i18nKey);
    function constrain(name, value, assert) {
      if (schema[name] !== undefined && !assert(value, schema[name])) {
        error(name, property, value, schema, errors);
      }
    }

    // Check if this value equals the value of another specified property, will cast the other property if needed
    function equal(otherProperty) {
      var otherValue = object[otherProperty];
      if (options.cast) {
        otherValue = cast(otherValue, schema);
      }
      if (otherValue !== value) {
          error('equal', property, value, schema, errors);
      }
    }

    if (value === undefined) {
      if (schema.required && schema.type !== 'any') {
        return error('required', property, undefined, schema, errors);
      } else {
        return;
      }
    }

    if (options.cast) {
      value = cast(value, schema);
    }

    if (typeof schema.equal === 'string') {
      equal(schema.equal);
    }

    if (schema.format && options.validateFormats) {
      format = schema.format;

      if (options.validateFormatExtensions) { spec = validate.formatExtensions[format] }
      if (!spec) { spec = validate.formats[format] }
      if (!spec) {
        if (options.validateFormatsStrict) {
          return error('format', property, value, schema, errors);
        }
      }
      else if (value !== null && value !== undefined ){
        if (!spec.test(value)) {
          return error('format', property, value, schema, errors);
        }
        // If it's a url format also check for unsafe characters
        if( format == "url" || format == "android_url" ) {
          if( /{|}|\||\\|\^/.test(value) ) {
            return error('format', property, value, schema, errors);
          }
        }
      }
    }

    if (schema['enum'] && schema['enum'].indexOf(value) === -1) {
      error('enum', property, value, schema, errors);
    }

    // Dependencies (see 5.8)
    if (typeof schema.dependencies === 'string' &&
      object[schema.dependencies] === undefined) {
      error('dependencies', property, null, schema, errors);
    }

    if (isArray(schema.dependencies)) {
      for (var i = 0, l = schema.dependencies.length; i < l; i++) {
        if (object[schema.dependencies[i]] === undefined) {
          error('dependencies', property, null, schema, errors);
        }
      }
    }

    if (typeof schema.dependencies === 'object') {
      validateObject(object, schema.dependencies, options, errors);
    }

    for (constraint in schema) {
      if (validate.keywords.indexOf(constraint) < 0) {
        var getClass = {};
        if (schema[constraint] && getClass.toString.call(object) == '[object Function]') {
          console.log("Applying custom constraint: " + constraint);
          constrain(constraint, value, function (a, e) {
            return e(a);
          });
        } else {
          console.log("Found non-keyword, non-function constraint, " + constraint + ", ignoring.")
        }
      } else {
        // console.log("Ignoring keyword: " + constraint);
      }
    }

    checkType(value, schema.type, function(err, type) {
      if (err) return error('type', property, typeof value, schema, errors);

      constrain('conform', value, function (a, e) { return e(a) });

      switch (type || (isArray(value) ? 'array' : typeof value)) {
        case 'string':
          constrain('minLength', value.length, function (a, e) { return a >= e });
          constrain('maxLength', value.length, function (a, e) { return a <= e });
          constrain('pattern',   value,        function (a, e) {
            e = typeof e === 'string'
              ? e = new RegExp(e)
              : e;
            return e.test(a)
          });
          break;
        case 'integer':
        case 'number':
          constrain('minimum',     value, function (a, e) { return a >= e });
          constrain('maximum',     value, function (a, e) { return a <= e });
          constrain('exclusiveMinimum', value, function (a, e) { return a > e });
          constrain('exclusiveMaximum', value, function (a, e) { return a < e });
          constrain('divisibleBy', value, function (a, e) {
            var multiplier = Math.max((a - Math.floor(a)).toString().length - 2, (e - Math.floor(e)).toString().length - 2);
            multiplier = multiplier > 0 ? Math.pow(10, multiplier) : 1;
            return (a * multiplier) % (e * multiplier) === 0
          });
          break;
        case 'array':
          constrain('items', value, function (a, e) {
            for (var i = 0, l = a.length; i < l; i++) {
              validateProperty(object, a[i], property, e, options, errors);
            }
            return true;
          });
          constrain('minItems', value, function (a, e) { return a.length >= e });
          constrain('maxItems', value, function (a, e) { return a.length <= e });
          constrain('uniqueItems', value, function (a) {
            var h = {};

            for (var i = 0, l = a.length; i < l; i++) {
              var key = JSON.stringify(a[i]);
              if (h[key]) return false;
              h[key] = true;
            }

            return true;
          });
          break;
        case 'object':
          // Recursive validation
          if (schema.properties || schema.patternProperties || schema.additionalProperties) {
            validateObject(value, schema, options, errors);
          }
          break;
      }
    });
  };

  function checkType(val, type, callback) {
    var result = false,
      types = isArray(type) ? type : [type];

    // No type - no check
    if (type === undefined) return callback(null, type);

    // Go through available types
    // And fine first matching
    for (var i = 0, l = types.length; i < l; i++) {
      type = types[i].toLowerCase().trim();
      if (type === 'string' ? typeof val === 'string' :
        type === 'array' ? isArray(val) :
          type === 'object' ? val && typeof val === 'object' &&
            !isArray(val) :
            type === 'number' ? typeof val === 'number' :
              type === 'integer' ? typeof val === 'number' && ~~val === val :
                type === 'null' ? val === null :
                  type === 'boolean'? typeof val === 'boolean' :
                    type === 'any' ? typeof val !== 'undefined' : false) {
        return callback(null, type);
      }
    };

    callback(true);
  };

  /**
   * Generate error function to use that uses the given i18n translation object
   * @param i18n {object} I18next translation object
   */
  function generateErrorFunction(i18n, i18nRootKey){

    // i18n config
    var namespace = "validation_translation";
    /**
     * Error function, to be returned with the given dictionary
     * @param attribute Attribute that failed (eg. 'type', 'conform')
     * @param property Property that is failing
     * @param actual What we actually received
     * @param schema The sub-schema of the property
     * @param errors Errors to inject into
     */
    var error = function(attribute, property, actual, schema, errors) {
      // Generate a message for this error
      var message, _ref;
      // Lookup, to be injected into final message
      var lookup = { expected: schema[attribute], attribute: attribute, property: property };
      // We try from most specific to least specific (exact dictionary key ->
      // normal revalidator workflow)

      // If we have a dictionary, try to use that, and fallback as needed
      if(typeof i18n !== "undefined" && i18n !== null){
//        console.log("Checking dictionary for: "+i18nRootKey+"/"+property+"/"+attribute);
        // generate context for translation -- schema provides a context per
        // attribute
        var context = {};
        // Include schema's i18nContext
        var i18nContext = schema.i18nContext;
        if( typeof i18nContext !== "undefined" && i18nContext !== null ){
          var subI18nContext = i18nContext[attribute];
          if( typeof subI18nContext !== "undefined" && subI18nContext !== null ){
            context = mixin(context, subI18nContext);
          }
        }
        // Mix lookup into sprintf and context
        context.sprintf = mixin({}, context.sprintf, lookup);
        context = mixin({}, context, lookup);

//        console.log(context);
        // Perform lookup with root key
        // If there is a root key, try a look up
        if( typeof i18nRootKey !== "undefined" && i18nRootKey !== null ){
          var translationKey = [
            namespace,
            [i18nRootKey, property, attribute].join(".")
          ].join(':');

          // If there is a translation value, set message!
//          console.log("Looking up "+translationKey);
          if( i18n.exists(translationKey) ){
            message = i18n.t(translationKey, context);
          }
        }

        // Perform lookup of property on global if we don't have a message yet
        if( typeof message === 'undefined' || message === null ){
          var translationKey = [
            namespace,
            ["globals", property, attribute].join(".")
          ].join(":");

          // If there is a translation value, set message !
//          console.log("Looking up "+translationKey);
          if( i18n.exists(translationKey) ){
            message = i18n.t(translationKey, context);
          }
        }

        // Perform lookup with generic key if we don't have a message yet
        if( typeof message === 'undefined' || message === null ){
          var translationKey = [
            namespace,
            ["generic", attribute].join(".")
          ].join(":");

          // If there is a translation value, set message !
//          console.log("Looking up "+translationKey);
          if( i18n.exists(translationKey) ){
            var genericMessage = i18n.t(translationKey, context);
          }
        }

      }
      if( typeof message === 'undefined' || message === null ){
        message = schema.messages && schema.messages[attribute] || schema.message || genericMessage || validate.messages[attribute] || "no default message";
        message = message.replace(/%\{([a-z]+)\}/ig, function (_, match) {
          var expected = lookup[match.toLowerCase()];
          if(expected == undefined || expected == null){
            expected = '';
          }
          return expected;
        });
      }
      errors.push({
        attribute: attribute,
        property:  property,
        expected:  schema[attribute],
        actual:    actual,
        message:   message
      });
    };
    return error;
  }

  function isArray(value) {
    var s = typeof value;
    if (s === 'object') {
      if (value) {
        if (typeof value.length === 'number' &&
          !(value.propertyIsEnumerable('length')) &&
          typeof value.splice === 'function') {
          return true;
        }
      }
    }
    return false;
  }


})(typeof(window) === 'undefined' ? module.exports : (window.json = window.json || {}));
