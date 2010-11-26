/*
    Copyright (C) 2009-2011 CREA Lab, CNRS/Ecole Polytechnique UMR 7656 (Fr)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var tinaviz = {};

$(document).ready(function(){

    $("#title").html("<h1>TinaWeb DEMO</h1>");

    tinaviz = new Tinaviz({
        tag: $("#vizdiv")
    });

    $(window).bind('resize', function() {
        var size = resize();
        // console.log("L29 tinaviz.size("+size.w+", "+size.h+")");
        tinaviz.size(size.w, size.h);
    });

    tinaviz.ready(function(){

        var size = resize();
        tinaviz.size(size.w, size.h);


        var prefs = {
            gexf: "default.gexf", // "FET60bipartite_graph_cooccurrences_.gexf"
            view: "macro",
            category: "Document",
            node_id: "",
            search: "",
            magnify: "0.5",
            cursor_size: "1.0",
            edge_filter_min: "0.0",
            edge_filter_max: "1.0",
            node_filter_min: "0.0",
            node_filter_max: "1.0",
            layout: "tinaforce",
            edge_rendering: "curve"

        };
        var urlVars = getUrlVars();
        for (x in urlVars) {
            prefs[x] = urlVars[x];
        }

        tinaviz.setView(prefs.view);

        var session = tinaviz.session();
        var macro = tinaviz.views.macro;
        var meso = tinaviz.views.meso;

        // session.add("nodes/0/keywords", "newKeyword");
        session.set("edgeWeight/min", parseFloat(prefs.edge_filter_min));
        session.set("edgeWeight/max", parseFloat(prefs.edge_filter_max));
        session.set("nodeWeight/min", parseFloat(prefs.node_filter_min));
        session.set("nodeWeight/max", parseFloat(prefs.node_filter_max));
        session.set("category/category", prefs.category);
        session.set("output/nodeSizeMin", 5.0);
        session.set("output/nodeSizeMax", 20.0);
        session.set("output/nodeSizeRatio", parseFloat(prefs.magnify));
        session.set("selection/radius", parseFloat(prefs.cursor_size));
        session.set("layout/algorithm", prefs.layout)
        session.set("rendering/edge/shape", prefs.edge_rendering);
        session.set("data/source", "gexf");

        macro.filter("Category", "category");
        macro.filter("NodeWeightRange", "nodeWeight");
        macro.filter("EdgeWeightRange", "edgeWeight");
        macro.filter("Output", "output");

        meso.filter("SubGraphCopyStandalone", "category");
        meso.set("category/source", "macro");
        meso.set("category/category", "Document");
        meso.set("category/mode", "keep");

        meso.filter("NodeWeightRangeHack", "nodeWeight");

        meso.filter("EdgeWeightRangeHack", "edgeWeight");

        console.log("meso.filter(\"Output\", \"output\")");
        meso.filter("Output", "output");


        /*
         * Initialization of the Infodiv
         */
        var layout_name = tinaviz.get("layout/algorithm");
        // use of different Infodiv-s following the type of graph
        if ( layout_name == "phyloforce" ) {
            tinaviz.infodiv = PhyloInfoDiv;
        }
        else {
            tinaviz.infodiv = InfoDiv;
        }
        tinaviz.infodiv.id = 'infodiv';
        tinaviz.infodiv.label = $( "#node_label" );
        tinaviz.infodiv.contents = $( "#node_contents" );
        tinaviz.infodiv.cloud = $( "#node_neighbourhood" );
        tinaviz.infodiv.cloudSearch = $("#node_neighbourhoodForSearch");
        tinaviz.infodiv.cloudSearchCopy = $( "#node_neighbourhoodCopy" );
        tinaviz.infodiv.unselect_button= $( "#toggle-unselect" );
        tinaviz.infodiv.node_table = $( "#node_table > tbody" );
        tinaviz.infodiv.categories = {
            'NGram' : 'Keyphrases',
            'Document' : 'Documents'
        };
        tinaviz.infodiv.reset();
        $("#infodiv").accordion();
        toolbar.init();

        tinaviz.open({
            before: function() {
                $('#appletInfo').show();
                $('#appletInfo').html("please wait while loading the graph..");
                $('#appletInfo').effect('pulsate', {}, 'fast');
                console.log("tinaviz.infodiv.reset()");
                tinaviz.infodiv.reset();
            },
            success: function() {
                // init the node list with prefs.category
                tinaviz.infodiv.updateNodeList( "macro", prefs.category );
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();
                var view = tinaviz.views.current;
                console.log("var view = tinaviz.views.current  (got "+tinaviz.views.current+")");

                // initialize the sliders
                console.log("$(\"#sliderNodeSize\").slider( \"option\", \"value\",  parseInt(view.get(\"output/nodeSizeRatio\")) *100 );");
                $("#sliderNodeSize").slider( "option", "value",
                    parseInt(view.get("output/nodeSizeRatio")) *100
                    );
                console.log("$(\"#sliderSelectionZone\").slider( \"option\", \"value\",  parseInt(view.get(\"selection/radius\")) *100 );");
                $("#sliderSelectionZone").slider( "option", "value",
                    parseInt(view.get("selection/radius")) * 100
                    );
                console.log("$(\"#sliderEdgeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"edgeWeight/min\") ), parseInt(view.get(\"edgeWeight/max\")) *100 ]);");
                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("edgeWeight/min") ),
                    parseInt(view.get("edgeWeight/max")) *100
                    ]);
                console.log("$(\"#sliderNodeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"nodeWeight/min\") ), parseInt(view.get(\"nodeWeight/max\")) *100 ]);");
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("nodeWeight/min") ),
                    parseInt(view.get("nodeWeight/max")) *100
                    ]);


                if (prefs.node_id != "") {
                    console.log("tinaviz.selectFromId("+prefs.node_id+", true)");
                    tinaviz.selectFromId( prefs.node_id, true );
                }

                if (prefs.search != "") {
                    $("#search_input").val(prefs.search);
                    console.log("tinaviz.searchNodes("+prefs.search+", \"containsIgnoreCase\")");
                    tinaviz.searchNodes(prefs.search, "containsIgnoreCase");
                }
                $("#appletInfo").hide();
                // caches the ngrams list
                tinaviz.getNodes( prefs.view, "NGrams" );
            },
            error: function(msg) {
                $("#appletInfo").html("Error, couldn't load graph: "+msg);
            }
        });

        tinaviz.open({
            view: prefs.view,
            url: prefs.gexf,
            layout: prefs.layout
        });

        tinaviz.event({

            /*
             * selection.viewName  : string = 'macro'|'meso'
             * selection.mouseMode : strong = 'left'|'doubleLeft'|'right'|'doubleRight'
             * selection.data      : strong = { ... }
             *
             **/
            selectionChanged: function(selection) {
                if ( selection.mouseMode == "left" ) {
                // nothing to do
                } else if ( selection.mouseMode == "right" ) {
                // nothing to do
                } else if (selection.mouseMode == "doubleLeft") {
                    var macroCategory = tinaviz.views.macro.category();
                    //console.log("selected doubleLeft ("+selection.viewName+","+selection.data+")");
                    tinaviz.views.meso.category(macroCategory);
                    if (selection.viewName == "macro") {
                        console.log("tinaviz.setView(\"meso\")");
                        tinaviz.setView("meso");
                    }
                    tinaviz.infodiv.updateNodeList("meso", macroCategory);
                    tinaviz.views.meso.set("layout/iter", 0);
                    tinaviz.autoCentering();
                }
                tinaviz.infodiv.update(selection.viewName, selection.data);
            },

            getNeighbourhood: function(selection_list, neighbour_node_list) {
                tinaviz.infodiv.updateTagCloud(selection_list, neighbour_node_list);
            },
            viewChanged: function(view) {
                tinaviz.autoCentering();

                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("edgeWeight/min") ),
                    parseInt(view.get("edgeWeight/max")) *100
                    ]);
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("nodeWeight/min") ),
                    parseInt(view.get("nodeWeight/max")) *100
                    ]);
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();

                var showFilter = false;
                if (view.name() == "meso") {

                    // TODO check selection
                    // if selection has edges with edge of all the same weight, we disable the filter
                    var weight = null;
                    for (node in view.nodes) {
                        //alert("node:"+node);
                        for (out in node.outputs) {
                            //alert("node weight:"+out.weight);
                            if (weight == null) {
                                weight = out.weight;
                            }
                            else {
                                if (weight != out.weight) {
                                    showFilter = true;
                                    break;
                                }
                            }
                        }
                    }

                }
                $("#sliderEdgeWeight").slider( "option", "disabled", false );
            },
            categoryChanged: function() {

            }
        });

        var size = resize();
        tinaviz.size(size.w, size.h);
    });

});
