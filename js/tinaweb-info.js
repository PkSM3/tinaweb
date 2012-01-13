var InfoDiv, displayNodeRow,
  _this = this;

displayNodeRow = function(label, id, category) {
  return $("#node_table > tbody").append($("<tr></tr>").append($("<td id='node_list_" + id + "'></td>").text(label).click(function(eventObject) {
    return app.viewMeso(id, category);
  })));
};

InfoDiv = {
  id: null,
  selection: [],
  neighbours: [],
  node_list_cache: {},
  last_category: "",
  node_table: null,
  label: null,
  contents: null,
  cloud: null,
  cloudSearch: null,
  cloudSearchCopy: null,
  unselect_button: null,
  categories: {
    NGram: "Keyphrases",
    Document: "Documents"
  },
  display_current_category: function() {
    var categories,
      _this = this;
    categories = this.categories;
    return app.getView(function(data) {
      var view;
      view = data.view;
      return app.getCategory(function(data) {
        var cat;
        cat = data.category;
        if (view === "macro") {
          return $("#toggle-switch").button("option", "label", categories[cat]);
        } else {
          return $("#toggle-switch").button("option", "label", categories[cat] + " neighbours");
        }
      });
    });
  },
  display_current_view: function() {
    var _this = this;
    return app.getView(function(data) {
      var level, title, view;
      view = data.view;
      if (view !== void 0) {
        level = $("#level");
        level.button("option", "label", view + " level");
        title = $("#infodiv > h3:first");
        if (view === "meso") {
          level.addClass("ui-state-highlight");
          return title.addClass("ui-state-highlight");
        } else {
          level.removeClass("ui-state-highlight");
          return title.removeClass("ui-state-highlight");
        }
      }
    });
  },
  mergeNeighbours: function(category, neighbours) {
    var merged, neighb, node;
    merged = [];
    for (node in neighbours) {
      for (neighb in neighbours[node]) {
        if (neighb in merged) {
          merged[neighb]["degree"]++;
        } else if (neighbours[node][neighb]["category"] !== category) {
          merged[neighb] = {
            spanid: neighb,
            id: neighbours[node][neighb]["id"],
            label: neighbours[node][neighb]["label"],
            degree: 1,
            weight: neighbours[node][neighb]["weight"],
            category: neighbours[node][neighb]["category"]
          };
        }
      }
    }
    this.neighbours = Object.keys(merged);
    merged = numericListSort(Object.values(merged), "degree");
    return merged;
  },
  updateTagCloud: function(node_list, neighbours) {
    var _this = this;
    if (Object.size(node_list) === 0) return;
    return app.getCategory(function(data) {
      var Googlerequests, PubMedrequests, cat, const_doc_tag, i, nb_displayed_tag, oppositeRealName, requests, sizecoef, tag, tagLabel, tagcloud, tagspan, tmp, tooltip;
      cat = data.category;
      neighbours = _this.mergeNeighbours(cat, neighbours);
      _this.cloudSearch.empty();
      Googlerequests = "http://www.google.com/#q=";
      PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
      requests = "";
      i = 0;
      while (i < neighbours.length) {
        tag = neighbours[i];
        tagLabel = tag.label;
        tagLabel = jQuery.trim(tagLabel);
        requests = requests + "%22" + tagLabel.replace(" ", "+") + "%22";
        if (i < neighbours.length - 1) requests = requests + "+AND+";
        i++;
      }
      if (cat != null) {
        oppositeRealName = _this.categories[app.getOppositeCategory(cat)];
        if (oppositeRealName != null) {
          tmp = "Search on: <a href=\"";
          tmp += Googlerequests;
          tmp += requests;
          tmp += "\" alt=\"search on google\" target=\"_BLANK\"><img src=\"";
          tmp += app.config.path;
          tmp += "css/branding/google.png\" />Google</a> &nbsp;";
          tmp += " <a href=\"" + PubMedrequests + requests;
          tmp += "\" alt=\"search on PubMed\" target=\"_BLANK\"><img src=\"";
          tmp += app.config.path;
          tmp += "css/branding/pubmed.png\" />Pubmed</a>";
          _this.cloudSearch.append(tmp);
        }
      }
      sizecoef = 15;
      const_doc_tag = 12;
      tooltip = "";
      tagcloud = $("<p></p>");
      nb_displayed_tag = 0;
      i = 0;
      while (i < neighbours.length) {
        if (nb_displayed_tag < 20) {
          nb_displayed_tag++;
          tag = neighbours[i];
          tagspan = $("<span id='" + tag.spanid + "'></span>");
          tagspan.addClass("ui-widget-content");
          tagspan.addClass("viz_node");
          tagspan.html(tag.label);
          (function() {
            var attached_cat, attached_id;
            attached_id = tag.id;
            attached_cat = tag.category;
            return tagspan.click(function() {
              return app.viewMeso(attached_id, attached_cat, function() {});
            });
          })();
          if (neighbours.length === 1) {
            if (tag["category"] === "Document") {
              tagspan.css("font-size", const_doc_tag);
            } else {
              tagspan.css("font-size", Math.floor(sizecoef * (Math.min(20, Math.log(1.5 + tag.weight)))));
            }
            tooltip = "click on a label to switch to its meso view - size is proportional to edge weight";
          } else {
            tagspan.css("font-size", Math.max(Math.floor(sizecoef * Math.min(2, Math.log(1.5 + tag.degree))), 15));
            tooltip = "click on a label to switch to its meso view - size is proportional to the degree";
          }
          tagcloud.append(tagspan);
          if (i !== neighbours.length - 1 && neighbours.length > 1) {
            tagcloud.append(", &nbsp;");
          }
        } else if (nb_displayed_tag === 20) {
          tagcloud.append("[...]");
          nb_displayed_tag++;
        } else {
          break;
        }
        i++;
      }
      _this.cloud.empty();
      _this.cloud.append("<h3>selection related to " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>");
      _this.cloud.append(tagcloud);
      _this.cloudSearchCopy.empty();
      _this.cloudSearchCopy.append("<h3>global search on " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>");
      return _this.cloudSearchCopy.append(tagcloud.clone());
    });
  },
  updateInfo: function(lastselection) {
    return app.getCategory(function(data) {
      var cat, contentinnerdiv, htmlContent, id, label, labelinnerdiv, node, number_of_label;
      cat = data.category;
      labelinnerdiv = $("<div></div>");
      contentinnerdiv = $("<div></div>");
      number_of_label = 0;
      for (id in lastselection) {
        node = lastselection[id];
        if (node.category === cat) {
          label = node.label;
          number_of_label++;
          if (number_of_label < 5) {
            labelinnerdiv.append($("<b></b>").text(label));
          } else {
            if (number_of_label === 5) {
              labelinnerdiv.append($("<b></b>").text("[...]"));
            }
          }
          _this.selection.push(node.id);
          log("label: " + label);
          contentinnerdiv.append($("<b></b>").text(label));
          htmlContent = htmlDecode(decodeJSON(node.content));
          log("  htmlContent: " + htmlContent);
          contentinnerdiv.append($("<p></p>").html(htmlContent));
          contentinnerdiv.append($("<p></p>").html(_this.getSearchQueries(label, cat)));
        }
      }
      if (_this.selection.length !== 0) {
        _this.label.empty();
        _this.unselect_button.show();
        _this.contents.empty();
        _this.label.append(alphabeticJquerySort(labelinnerdiv, "b", ", &nbsp;"));
        return _this.contents.append(contentinnerdiv);
      } else {
        return _this.reset();
      }
    });
  },
  update: function(view, lastselection) {
    if (_this.id == null) {
      alert("error : infodiv not initialized with its HTML DIV id");
      return;
    }
    if (Object.size(lastselection) === 0) {
      _this.reset();
      return;
    }
    _this.selection = [];
    _this.updateInfo(lastselection);
    return app.getNeighbourhood("macro", _this.selection, function(data) {
      return log("received neighbourhood");
    });
  },
  reset: function() {
    var path;
    if (_this.id == null) {
      alert("error : infodiv not initialized with its HTML DIV id");
      return;
    }
    _this.unselect_button.hide();
    _this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));
    path = app.config.path;
    _this.contents.empty().append($("<h4></h4>").html("<h2>Navigation tips</h2>" + "<p align='left'>" + "<br/>" + "<i>Basic interactions</i><br/><br/>" + "Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='" + path + "css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='" + path + "css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type." + "<br/><br/>" + "<i>Graph manipulation</i><br/><br/>" + "Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>" + "<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  " + "Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks." + "</p>"));
    _this.cloudSearchCopy.empty();
    _this.cloudSearch.empty();
    _this.cloud.empty();
    _this.selection = [];
    _this.neighbours = [];
    _this.last_category = "";
  },
  updateNodeList: function(view, category) {
    var whenReceivingNodeList,
      _this = this;
    this.display_current_category();
    if (category === this.last_category) return;
    if (app.node_list_cache === void 0) app.node_list_cache = {};
    whenReceivingNodeList = function(data) {
      var i, node_list, _results;
      log("receiving and updating node.list: " + data.nodes.length + " nodes");
      if (category === _this.last_category) return;
      if (_this.node_list_cache === void 0) _this.node_list_cache = {};
      _this.node_list_cache[category] = alphabeticListSort(data.nodes, "label");
      _this.node_table.empty();
      _this.last_category = category;
      node_list = _this.node_list_cache[category];
      if (node_list != null) {
        i = 0;
        _results = [];
        while (i < node_list.length) {
          (function() {
            var rowCat, rowId, rowLabel,
              _this = this;
            rowLabel = htmlDecode(decodeJSON(node_list[i]["label"]));
            rowId = decodeJSON(node_list[i]["id"]);
            rowCat = category;
            return delay(0, function() {
              return displayNodeRow(rowLabel, rowId, rowCat);
            });
          })();
          _results.push(i++);
        }
        return _results;
      }
    };
    return app.getNodes(view, category, whenReceivingNodeList);
  },
  getSearchQueries: function(label, cat) {
    var SearchQuery, path;
    path = app.config.path;
    SearchQuery = label.replace(RegExp(" ", "g"), "+");
    if (cat === "Document") {
      return $("<p></p>").html("<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/flickr.png\" height=15 width=15> </a>");
    } else if (cat === "NGram") {
      return $("<p></p>").html("<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + path + "css/branding/flickr.png\" height=15 width=15> </a>");
    } else {
      return $("<p></p>");
    }
  }
};
