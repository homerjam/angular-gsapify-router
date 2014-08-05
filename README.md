# angular-gsapify-router

Angular UI-Router animation directive allowing configuration of state transitions using [GSAP](http://www.greensock.com/gsap-js/)

## Installation

`$ bower install angular-gsapify-router --save`

## Usage

```javascript

// Setup dependencies
angular.module('myApp', ['ui-router', 'hj.gsapifyRouter'])

// Configure app
.config(function($stateProvider, gsapifyRouterProvider) {

	// Set default transition to use if unspecified on view
	gsapifyRouterProvider.default = 'none'; // name of transition to use or 'none'

	// Add a new transition
	gsapifyRouterProvider.transition('slideToFromRight', {
        duration: 0.5, // transition duration
        delay: 0.5, // transition delay
        css: { // start/end point for transition (eg. off screen)
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
            // define transitions in data object of state using `gsapifyRouter.VIEWNAME`
            // to allow inheritance/overwriting of transition preferences
            gsapifyRouter.main: {
                enter: { // when entering this state
                    incoming: { // use this transition on the incoming view
                        transition: 'slideToFromRight', // name of transition to use or 'none'
                        priority: 1 // priority determines whether to use transition of entering or leaving state
                    },
                    outgoing: { // use this transition on the outgoing state
                        transition: 'slideToFromLeft',
                        priority: 1
                    }
                },
                leave: { // when leaving this state
                    incoming: { // use this transition on the incoming view
                        transition: 'slideToFromLeft',
                        priority: 1
                    },
                    outgoing: { // use this transition on the outgoing state
                        transition: 'slideToFromRight',
                        priority: 1
                    }
                },
            }
        }        
    });

});

```

```html
<!-- add 'gsapify-router' class to ui-view element -->
<div ui-view="main" class="gsapify-router" autoscroll="false"></div>
```