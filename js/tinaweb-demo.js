// Generated by CoffeeScript 1.3.1
var Demo,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Demo = (function() {

  Demo.name = 'Demo';

  function Demo(startAfter, repeatEvery) {
    var _this = this;
    this.startAfter = startAfter != null ? startAfter : 6;
    this.repeatEvery = repeatEvery != null ? repeatEvery : 10;
    this._loop = __bind(this._loop, this);

    this.looping = false;
    $(document).nap({
      fallAsleep: function() {
        return _this.start();
      },
      wakeUp: function() {
        return _this.pause();
      },
      standByTime: this.startAfter
    });
  }

  Demo.prototype.start = function() {
    console.log("demo: start() called. looping: " + this.looping);
    if (this.looping) {
      return;
    }
    this.looping = true;
    return this._loop();
  };

  Demo.prototype.pause = function() {
    return this.looping = false;
  };

  Demo.prototype._loop = function() {
    if (!this.looping) {
      return;
    }
    this.looping = true;
    this.doSomething();
    return delay(this.repeatEvery * 1000, this._loop);
  };

  Demo.prototype.pickRandomNode = function(category) {
    var arr;
    arr = app.infodiv.node_list_cache[category];
    return arr[Math.floor(Math.random() * arr.length)];
  };

  Demo.prototype.selectRandomNeighbor = function() {
    var len, nei, nei_size;
    len = app.infodiv.neighbours.length;
    if (len > 0 && P(0.80)) {
      nei = app.infodiv.neighbours[Math.floor(Math.random() * len)];
      nei_size = nei != null ? nei.length : 0;
      return app.getView(function(data) {
        if (data.view === "meso" && nei_size === 0) {
          return $("#level").click();
        } else {
          return app.unselect(function() {
            var node;
            app.infodiv.reset();
            node = nei[Math.floor(Math.random() * nei_size)];
            return app.select(node.id);
          });
        }
      });
    } else {
      return $("#toggle-switch").click();
    }
  };

  Demo.prototype.viewMesoRandomNode = function() {
    var _this = this;
    return app.getCategory(function(data) {
      var node;
      node = _this.pickRandomNode(data.category);
      return app.viewMeso(node.id, data.category);
    });
  };

  Demo.prototype.selectRandomNode = function() {
    var _this = this;
    return app.getCategory(function(data) {
      return app.unselect(function() {
        var node;
        app.infodiv.reset();
        node = _this.pickRandomNode(data.category);
        return app.select(node.id);
      });
    });
  };

  Demo.prototype.doSomething = function() {
    var _this = this;
    return app.getView(function(data) {
      if (typeof console.log === "function") {
        console.log("demo: doing random action: " + data.view);
      }
      switch (data.view) {
        case "macro":
          console.log("demo: in macro actions");
          if (P(0.20)) {
            return _this.selectRandomNode();
          } else {
            return _this.viewMesoRandomNode();
          }
          break;
        case "meso":
          console.log("in meso actions");
          if (P(0.20)) {
            return _this.selectRandomNeighbor();
          } else {
            return $("#level").click();
          }
      }
    });
  };

  return Demo;

})();
