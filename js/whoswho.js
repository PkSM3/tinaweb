var completion, gexf, ids;

jQuery.fn.disableTextSelect = function() {
  return this.each(function() {
    if (typeof this.onselectstart !== "undefined") {
      return this.onselectstart = function() {
        return false;
      };
    } else if (typeof this.style.MozUserSelect !== "undefined") {
      return this.style.MozUserSelect = "none";
    } else {
      this.onmousedown = function() {
        return false;
      };
      return this.style.cursor = "default";
    }
  });
};

ids = 0;

completion = {};

gexf = "";

$(document).ready(function() {
  var cache, popfilter, xhrs;
  log("document ready.. installing whoswho");
  popfilter = function(label, type, options) {
    var footer, header, id, id1, id2, input, labelization;
    id = ids++;
    id1 = "filter" + id;
    id2 = "combo" + id;
    header = "<li id=\"" + id1 + "\" class=\"filter\" style=\"padding-top: 5px;\">";
    labelization = "<span style=\"color: #fff;\">&nbsp; " + label + " </span>";
    input = "<input type=\"text\" id=\"" + id2 + "\" class=\"medium filter" + type + "\" placeholder=\"" + type + "\" />";
    footer = "</li>;";
    $(header + labelization + input + footer).insertBefore("#refine");
    $("#" + id2).catcomplete({
      minLength: 2,
      source: function(request, response) {
        var term;
        term = request.term;
        return $.getJSON("autocomplete.php", {
          category: type,
          term: request.term
        }, function(data, status, xhr) {
          return response(data.results);
        });
      }
    });
    $("" + id1).hide();
    show("#" + id1);
    return false;
  };
  jQuery(".unselectable").disableTextSelect();
  $(".unselectable").hover((function() {
    return $(this).css("cursor", "default");
  }), function() {
    return $(this).css("cursor", "auto");
  });
  hide("#search-form");
  $(".topbar").hover((function() {
    return $(this).stop().animate({
      opacity: 0.98
    }, "fast");
  }), function() {
    return $(this).stop().animate({
      opacity: 0.93
    }, "fast");
  });
  $.widget("custom.catcomplete", $.ui.autocomplete, {
    _renderMenu: function(ul, items) {
      var categories, self;
      self = this;
      categories = _.groupBy(items, function(o) {
        return o.category;
      });
      return _.each(categories, function(data, category) {
        var size, term, total;
        size = 0;
        total = 0;
        term = "";
        _.each(data, function(item) {
          size = item.size;
          total = item.total;
          term = item.term;
          return self._renderItem(ul, item);
        });
        ul.append("<li class='ui-autocomplete-category'>" + size + "/" + total + " results</li>");
        log(term);
        return ul.highlight(term);
      });
    }
  });
  cache = {};
  xhrs = {};
  $("#addfiltercountry").click(function() {
    return popfilter("in", "countries", []);
  });
  $("#addfilterorganization").click(function() {
    return popfilter("from", "organizations", []);
  });
  $("#addfilterlaboratory").click(function() {
    var prefix;
    prefix = "working";
    return popfilter("" + prefix + " at", "laboratories", []);
  });
  $("#addfilterkeyword").click(function() {
    var prefix;
    prefix = "working";
    return popfilter("" + prefix + " on", "keywords", []);
  });
  $("#addfiltertag").click(function() {
    return popfilter("tagged", "tags", []);
  });
  hide("#loading");
  $("#example").click(function() {
    hide(".hero-unit");
    return $("#welcome").fadeOut("slow", function() {
      return show("#loading", "fast");
    });
  });
  return $("#generate").click(function() {
    hide(".hero-unit");
    $("#welcome").fadeOut("slow", function() {
      var collect, query;
      show("#loading", "fast");
      collect = function(k) {
        var t;
        t = [];
        log("collecting .filter" + k);
        $(".filter" + k).each(function(i, e) {
          var value;
          value = $(e).val();
          if (value != null) {
            log("got: " + value);
            value = value.replace(/^\s+/g, "").replace(/\s+$/g, "");
            log("sanitized: " + value);
            if (value !== " " || value !== "") {
              log("keeping " + value);
              return t.push(value);
            }
          }
        });
        return t;
      };
      log("reading filters forms..");
      query = {
        categorya: $("#categorya :selected").text(),
        categoryb: $("#categoryb :selected").text(),
        keywords: collect("keywords"),
        countries: collect("countries"),
        laboratories: collect("laboratories"),
        coloredby: [],
        tags: collect("tags"),
        organizations: collect("organizations")
      };
      log("raw query: ");
      log(query);
      query = encodeURIComponent(JSON.stringify(query));
      gexf = "getgraph.php?query=" + query;
      log("url query: " + gexf);
      log("injecting applet");
      if ($('#frame').length === 0) {
        return $("#visualization").html("<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>");
      } else {
        return log("applet already exists");
      }
    });
    return false;
  });
});
