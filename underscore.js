(function(root){
  // 构造函数，
  var _ = function(obj) {
    // 因为数据源是
    if(!(this instanceof _)) {
      return new _(obj)
    }
    this.wrap = obj;
  }

  // 开启链式调用
  _.chain = function(obj) {  // 数据源
    var instance = new _(obj);  // 特殊的实例对象
    instance._chain = true;  // 特殊的属性  凭证
    return instance;
  }

  // 链式调用的辅助函数
  var result = function(instance, obj) {
    if (instance._chain) {
      instance.wrap = obj
      return instance
    }
    return obj;
  }

  // 结束链式调用 直接返回处理之后的值
  _.prototype.value = function() {
    return this.wrap
  }

  // 函数在js里就是对象, map就是_对象的静态属性
  _.map = function(obj, iteratee, context) {
    // 生成不同功能迭代器
    var iteratee = cb(iteratee, context);
    // 分辨obj是数组对象还是object对象, 如果不是数组对象就直接通过Object.keys()这种方法获取对象当前所有的可枚举属性，存在一个数组里面，把它赋值给keys
    var keys = !_.isArray(obj) && Object.keys(obj);
    var length = (keys || obj).length;
    var result = Array(length);  // 返回一个对应长度的空数组

    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      result[index] = iteratee(obj[currentKey], index, obj);
    }

    return result;

  }
  // 参数count的意思是：在生成迭代器的时候有没有一些参数的要求
  var cb = function(iteratee, context, count) {
    if (iteratee == null) {
      return _.identity;
    }
    if (_.isFunction(iteratee)) {
      return optimizeCb(iteratee, context, count)
    }
  }
  // 默认迭代器
  _.identity = function(value) {
    return value;
  }

  // optimizeCb优化迭代器
  // 参数里的context 对应的是map 的第三个参数, 如果没传就返回迭代器函数本身
  var optimizeCb = function(func, context, count) {
    console.log(context, 'context') 
    if (context == void 0) {
      return func;
    }

    switch (count == null ? 3 : count) {
      case 1:
        return function(value) {
          return func.call(context, value)
        };
      case 3: 
        return function(value, index, obj) {
          return func.call(context, value, index, obj)
        }
    }
  }

  // 是否是function
  _.isFunction = function(func) {
     return toString.call(func) === '[object Function]'
  }
  // 是否是数组
  _.isArray = function(obj) {
    return toString.call(obj) === '[object Array]'
  }
  // 是否是对象
  _.isObject = function(obj) {
    return toString.call(obj) === '[object, Object]'
  }
  // 
  _.isArguments = function() {
    
  }
 
  // rest参数
  _.restArguments = function(func) {
    // func.length指的是func这个函数的参数的长度
    // rest参数位置
    var startIndex = func.length - 1;
    console.log(startIndex, 'start')
    return function() {
      console.log(this, 'this')
      // arguments指的是调用restTest时传进去的参数
      var length = arguments.length - startIndex,  // 当restTest的参数为4，而rest数组的startIndex为1，也就是func的参数只有两个时，rest数组的长度就是arguments.length - startIndex的差
          rest = Array(length),
          index = 0;
      // rest 数组中的成员
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      // 非rest参数成员的值一一对应 args === [1, [2,3,4]]
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }

      args[startIndex] = rest;
      return func.apply(this, args);
    }
  }

  // Object.create()方法创建一个新对象，使用现有的对象来提供新创建的对象的__proto__; 不依赖构造函数，它内部已维护来一个构造函数，并将该构造函数的prototype属性指向传入的对象，因此，它比new更灵活
  // underscore如何创建对象？答：利用baseCreate创建对象时，会先检查当前环境是否已支持Object.create,如不支持，会创建一个简易的polyfill
  // Object.create polyfill  Object.create(object) baseCreate(object)
  var Ctor = function() {};
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (Object.create) return Object.create(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor();
    Ctor.prototype = null;
    return result;
  }

  _.unique = function(arr, callback) {
    var result = [];
    for(var i = 0; i < arr.length; i++) {
      var target = callback ? callback(arr[i]) : arr[i];
      if(result.indexOf(target) === -1) {
        result.push(target);
      }
    }
    return result;
  }

  _.flatten = function(array, shallow) {
    return flatten(array, shallow);
  }
 
  // 摊平数组
  var flatten = function(array, shallow) {
    var ret = [];
    var index = 0;
    for (var i = 0; i < array.length; i++) {
      var value = array[i]; // 展开一次
      if (_.isArray(value) || _.isArguments(value)) {
        // 递归全部展开
        if (!shallow) {
          value = flatten(value, shallow);
        }
        var j = 0,
            len = value.length;
        ret.length += len;
        while (j < len) {
          ret[index++] = value[j++]
        }
      } else {
        ret[index++] = value;
      }
    }
    return ret;
  }

  // 返回数组中除了最后一个元素外的其它全部元素 在arguments对象上特别有用
  _.initial = function(array, n) {
    return [].slice.call(array, 0, Math.max(0, array.length - ( n == null ? 1 : n))); // 这里的0是为了防止出现负数
  }

  // 返回数组中除了第一个元素外的其它全部元素， 传递n参数将返回从n开始的所有元素
  _.rest = function(array, n) {
    return [].slice.call(array, n == null ? 1 : n);
  }





  // 遍历_上的静态属性 数组，这个数组怎么得来的，是调用一个方法
  _.each = function(array, callback) {
    console.log(array);
    var i = 0;
    for(; i < array.length; i++) {
      callback.call(array, array[i])
    }
  }

  // 返回一个数组（_对象上的静态属性），将会传到_.each()里面,接收一个对象是 构造函数本身
  _.functions = function(obj) {
    var result = [];
    for(var key in obj) {
        result.push(key)
      }
    return result;
  }

  // mixin方法的作用是混入，将_扩展静态属性的方法混入到原型对象上去
  // 步骤： 1.找到_静态属性[map, unique, ... ]
  // 2. 遍历数组，将数组中的每个成员扩展到_的原型上去， _.prototype[item]
  // 3. 搭架子，架子搭好之后，就只需要关注单个功能的实现方面，比如说上面的map等方法的具体实现

  // obj参数指的是构造函数 _
  _.mixin = function(obj) {
    // each的第一个参数是调用functions的返回值，也就是构造函数的静态属性，
    // each的第二个参数 回调函数
    _.each(_.functions(obj), function(key) {
      // 将构造函数上的静态属性对应的引用 给到一个变量， 比如当key为map时，map对应的引用赋值给func;
      var func = obj[key];
      _.prototype[key] = function() {
        // 之前 当构造函数原型对象的key是unique时，会执行下面的函数， 现在将数据源和迭代器分离之后，
        // 如何在原型里找到数据源和迭代器函数
        // console.log(this.wrap, 'wrap')  
        // console.log(arguments[0])
        // 用什么方式（数组合并）将数据源和迭代器合并
        var args = [this.wrap];
        Array.prototype.push.apply(args, arguments)
        // 执行unique对应的迭代器函数，将this指向_的实例对象， args是迭代器的参数
        return result(this, func.apply(this, args)) 
      }
    })

    // }
  }

  // 调用mixin， 将构造函数传给它
  _.mixin(_)

  // 给root扩展一个underscore的属性，拿到underscore的引用
  root._ = _;

})(this)