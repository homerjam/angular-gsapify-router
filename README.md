# angular-gsapify-router

Angular UI-Router animation directive allowing configuration of state transitions using [GSAP](http://www.greensock.com/gsap-js/)

## Demo

[http://homerjam.github.io/angular-gsapify-router/](http://homerjam.github.io/angular-gsapify-router/)

## Installation

`$ bower install angular-gsapify-router --save`

## Usage

In your main app file eg. `app.js`:

```javascript

// Setup dependencies
angular.module('myApp', ['ui-router', 'hj.gsapifyRouter'])

// Configure app
.config(function($stateProvider, gsapifyRouterProvider) {

	// Set default transitions to use if unspecified
	gsapifyRouterProvider.defaults = {

        // name of transition to use or 'none'
        enter: 'fadeDelayed',

        leave: 'fade'

    };

	// Add a new transition
	gsapifyRouterProvider.transition('slideToFromRight', {

        // transition duration
        duration: 0.5,

        // transition delay
        delay: 0.5,

        // start/end point for transition (eg. off screen)
        css: {
            x: '100%'
        }

	});

	// Configure states
    $stateProvider.state('home', {
        url: '/',
        views: {
            main: {
                templateUrl: '/templates/home.html',
                controller: 'HomeCtrl as home'
            }
        },
        data: {

            // define transitions per view in the data object of state using
            // `gsapifyRouter.VIEWNAME` dot notation allows inheritance/overwriting
            // of transition preferences
            'gsapifyRouter.main': {

                // when entering this state
                enter: {

                    // use this transition on the incoming view
                    in: {

                        // name of transition to use
                        transition: 'slideToFromRight',

                        // (optional) priority to determine whether to use transition
                        // of entering or leaving state (highest wins)
                        priority: 1

                    },

                    // use this transition on the outgoing view
                    out: {
                        transition: 'slideToFromLeft',
                        priority: 2
                    }

                },

                // when leaving this state
                leave: {

                     // use this transition on the incoming view
                    in: {
                        transition: 'slideToFromLeft'
                    },

                     // use this transition on the outgoing view
                    out: 'slideToFromRight'

                },
            }
        }        
    });

});

```

In your templates:
```html
<!-- add 'gsapify-router' class to ui-view element -->
<div ui-view="main" class="gsapify-router" autoscroll="false"></div>
```

## TODO

* Events
