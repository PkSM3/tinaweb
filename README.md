#**TinaWeb** - *Bi-Partite Visualization Applet*

## Presentation

### Description

### Team: 

 - [Julian Bilcke](http://github.com/jbilcke) (Java,JS) 
 - [David Chavalarias](http://chavalarias.com) (Algorithms & Spec.)
 - [Elias Showk](http://github.com/elishowk) (JS, Python)

### Featured in:
- [Community Explorer](http://communityexplorer.org)
- [FET Open Explorer](http://tina.iscpif.fr/htdocs/fetopen)
- [Who's Who](http://tina.iscpif.fr/htdocs/whoswho)


## How-to use and hack Tinaweb

### Prerequisites

1. Install [Node](http://nodejs.org)
2. Install [npm](http://npm.org)
3. Install [Coffee-Script](http://coffeescript.org) globally using npm:

    $ sudo npm install coffeescript -g


### Building

  Just type:
  
    $ npm run-script build


## Architecture Overview

  
Tinaweb is made of three main parts:

  
###1. Some Application (HTML/JS User Interface)

Tinaweb being a web application, it naturally use HTML5 and JavaScript to build it's user interface:
interface layout, panels, buttons, icons, texts.  
  
  
The default interface try to be compatible with most kind of data/graph, and thus might seems a bit "heavy" at first glance.

Main files are:  

- index.html
- js/tinaweb-js
- js/tinaweb-toolbar.js

  
In js/ and css/ directories, are also some third-party dependencies, like JQuery and JQuery/UI.
You can customize your own user interface if you want to do so!


###2. Tinaweb, the High-Level Graph API


The JavaScript API is the graph library used to store, process, transform and render the graph.

It tries to implement most commonly-used functions across Tina projects, and thus is still in development.

The API does not directly manage the graph, but instead handle initialization and communication between

the Back-end engine and the HTML user interface

  


###3. Tinaviz, the low-level API

For the moment, there is only one back-end implementation, written as a Scala Applet.


**Warning Notes regarding the Java Applet**

For historical and deployment security reasons, the project had the requirement of being able to run on old, unmaintained machines, with legacy, never-upgraded browsers.

This is nearly an impossible task, and at the time a very few alternatives were available.  
  

Eventually, the Processing rendering engine was chosen after benchmarking.

Processing and Java Applet have very good software rendering performances and optimizations options (For instance, the applet make use an adaptive framerate, dynamic bezier curve resolution adjustment, anti-aliasing is disabled when necessary..).  
  

Later in the project, the Java applet was rewritten in Scala in order to resolve most threading synchronization issues

(related to communication with the web browser), and is now fully asynchronous, thanks to a new Message Passing interface

and the use of Scala's actor model.
  


However, being compatible with legacy browsers is now a burden, and a modern implementation (WebGL) is being investigated, which should allow the application

to work on mobile devices too.


###High Level Functions (Tinaweb)


####getView(callback)

  query for the current visualized view, reply back with data = { "view" : $view }

``` javascript
  // in JavaScript
  getView(function(data){ 
    console.log("view: "+data.view); 
  }); 
```

``` coffeescript
  # in CoffeeScript
  getView (data) ->
    console.log "view: "+data.view
```

####getCategory(callback)

query for the current category filter value, reply back with data = { "category" : $category }

``` javascript
  // in JavaScript
  getCategory (function(data){ 
    console.log("view: "+data.category); 
  }); 
```
``` coffeescript
  # in CoffeeScript
  getCategory (data) ->
    console.log "view: "+data.category
```

 

####selectByPattern(pattern, [callback])

select nodes whose labels contains a string

``` javascript
  // in JavaScript
  selectByPattern("soci", function(data){ 
    console.log("selection: "+data.selection); 
  }); 
```
``` coffeescript
  # in CoffeeScript
  selectByPattern "opti", (data) -> 
    console.log "selection: "+data.selection
```

  
####unselect(pattern, callback)

unselect everything (all nodes in all views)

``` javascript
  // in JavaScript
  unselect(function() { 
    console.log("selection should now be empty");
  });
```
``` coffeescript
  # in CoffeeScript
  unselect ->
    console.log "selection should now be empty"
```


###Low Level Functions (Tinaviz)

  You can send asynchronous messages to the applet by using the tinaviz.set and tinaviz.get functions

####set(key,value,[type])
``` javascript
  // in JavaScript
  set("layoutSpeed", 30, "Int");
```
``` coffeescript
  # in CoffeeScript
  set "pause", true, "Boolean"
```

###Supported key/values

####pause: Boolean

  * if true, will pause the layout (but not the rendering, so it is still possible to select items)
  * if false, this will restart the layout where it was paused  

####view: String ("macro" or "meso")
####category: String ("Document" or "NGram")
####layout: String ("tinaforce")
####layoutSpeed: Number in Javascript, Int  ("Document" or "NGram")
####pause: Boolean
####demo: Boolean

####Others parameters (not documented yet)
