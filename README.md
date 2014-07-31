# angular-gsapify-router

Angular UI-Router animation directive allowing configuration of [GSAP](http://www.greensock.com/gsap-js/) state transitions based on priority

## Installation

`$ bower install angular-gsapify-router --save`

## Usage

```javascript

// Setup app, specify dependencies
angular.module('myApp', ['ui-router', 'hj.gsapifyRouter'])

// Configure app
.config(function($stateProvider, gsapInOutProvider) {

	// Set default transition to use if unspecified on state
	gsapifyRouterProvider.default = {
	    transition: 'none', // name of transition to use or 'none'
	    priority: 0 // higher priority determines winning transition
	};

	// Add a new transition
	gsapifyRouter.transition('slideFromRight', {
	    // 'active' refers to incoming state/view if priority of incoming
	    // state is equal or higher than outgoing state, otherwise it refers
	    // to outgoing state/view
	    active: {
	        duration: 0.5, // transition duration
	        delay: 0.5, // transition delay
	        cssOrigin: { // start point for transition (eg. off screen)
	            x: '100%'
	        },
	        cssEnd: {
	            x: '0%' // end point for transition (eg. normal position)
	        }
	    },
	    // 'inactive' refers to outgoing state/view if priority of incoming
	    // state is equal or higher than outgoing state, otherwise it refers
	    // to incoming state/view
	    inactive: {
	        duration: 0.5,
	        cssOrigin: {
	            x: '100%'
	        },
	        cssEnd: {
	            x: '0%'
	        }
	    }
	});

    $stateProvider.state('home', {
        url: '/',
        views: {
            main: {
                templateUrl: '/templates/home.html',
                controller: 'HomeCtrl as home'
        },
        data: {
        	// set options in 'data' property of state
            gsapifyRouter: {
                priority: 0,
                transition: 'fade'
            }
        }
    });

    $stateProvider.state('portfolio', {
        url: '/portfolio',
        views: {
            main: {
                templateUrl: '/templates/portfolio.html',
                controller: 'PortfolioCtrl as portfolio'
        },
        data: {
            gsapifyRouter: {
                priority: 1,
                transition: 'slideFromRight'
            }
        }
    });

});

```