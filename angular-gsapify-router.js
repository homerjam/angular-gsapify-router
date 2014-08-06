/*

    Name: angular-gsapify-router
    Description: Angular UI-Router animation directive allowing configuration of state transitions using [GSAP](http://www.greensock.com/gsap-js/)
    Author: jameshomer85@gmail.com
    Licence: MIT
    Usage: http://github.com/homerjam/angular-gsapify-router

*/
(function() {
    'use strict';

    angular.module('hj.gsapifyRouter', ['ui.router', 'ngAnimate'])

    .constant('TweenMax', TweenMax)

    .provider('gsapifyRouter', function() {
        var self = this;

        self.transitions = {};

        self.transitions.above = {
            duration: 1,
            ease: 'Quart.easeInOut',
            css: {
                y: '-100%'
            }
        };

        self.transitions.below = {
            duration: 1,
            ease: 'Quart.easeInOut',
            css: {
                y: '100%'
            }
        };

        self.transitions.left = {
            duration: 1,
            ease: 'Quint.easeInOut',
            css: {
                x: '-100%'
            }
        };

        self.transitions.right = {
            duration: 1,
            ease: 'Quint.easeInOut',
            css: {
                x: '100%'
            }
        };

        self.transitions.fade = {
            duration: 0.5,
            css: {
                opacity: 0
            }
        };

        self.transitions.fadeDelayed = {
            duration: 0.5,
            delay: 0.5,
            css: {
                opacity: 0
            }
        };

        self.transitions.none = {
            duration: 0,
            css: {}
        };

        self.defaults = {
            enter: 'none',
            leave: 'none'
        };

        self.transition = function(transitionName, transitionOptions) {
            self.transitions[transitionName] = transitionOptions;
        };

        self.$get = ['$rootScope', '$state', '$document', '$timeout', '$q', '$log', 'TweenMax',
            function($rootScope, $state, $document, $timeout, $q, $log, TweenMax) {
                $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                    $state.previous = fromState;
                    $state.previousParams = fromParams;
                });

                var enter = function(element) {
                    var deferred = $q.defer();

                    var view = element.attr('ui-view'),
                        current = $state.current,
                        previous = $state.previous,
                        promises = [];

                    var currentOpts = {
                        transition: self.defaults.enter,
                        priority: 0
                    };

                    if (current.data) {
                        if (current.data['gsapifyRouter.' + view]) {
                            currentOpts = current.data['gsapifyRouter.' + view].enter.in;
                        }
                    }

                    var previousOpts = {
                        transition: self.defaults.enter,
                        priority: 0
                    };

                    if (previous.data) {
                        if (previous.data['gsapifyRouter.' + view]) {
                            previousOpts = previous.data['gsapifyRouter.' + view].leave.in;
                        }
                    }

                    var from;

                    if (previousOpts.priority > currentOpts.priority) {
                        from = self.transitions[previousOpts.transition];

                        if (!from) {
                            $log.error("gsapifyRouter: Invalid transition '" + previousOpts.transition + "'");
                        }

                    } else {
                        from = self.transitions[currentOpts.transition];

                        if (!from) {
                            $log.error("gsapifyRouter: Invalid transition '" + currentOpts.transition + "'");
                        }
                    }

                    var duration = from.duration,
                        vars = angular.copy(from);

                    var transitionDeferred = $q.defer();

                    vars.onStart = function() {
                        element.css('visibility', 'visible');
                    };

                    vars.onComplete = function() {
                        deferred.resolve();
                    };

                    TweenMax.from(element, duration, vars);

                    return deferred.promise;
                };

                var leave = function(element) {
                    var deferred = $q.defer();

                    var view = element.attr('ui-view'),
                        current = $state.current,
                        previous = $state.previous,
                        promises = [];

                    var previousOpts = {
                        transition: self.defaults.leave,
                        priority: 0
                    };

                    if (previous.data) {
                        if (previous.data['gsapifyRouter.' + view]) {
                            previousOpts = previous.data['gsapifyRouter.' + view].leave.out;
                        }
                    }

                    var currentOpts = {
                        transition: self.defaults.leave,
                        priority: 0
                    };

                    if (current.data) {
                        if (current.data['gsapifyRouter.' + view]) {
                            currentOpts = current.data['gsapifyRouter.' + view].enter.out;
                        }
                    }

                    var to;

                    if (currentOpts.priority > previousOpts.priority) {
                        to = self.transitions[currentOpts.transition];

                        if (!to) {
                            $log.error("gsapifyRouter: Invalid transition '" + currentOpts.transition + "'");
                        }

                    } else {
                        to = self.transitions[previousOpts.transition];

                        if (!to) {
                            $log.error("gsapifyRouter: Invalid transition '" + previousOpts.transition + "'");
                        }
                    }

                    var duration = to.duration,
                        vars = angular.copy(to);

                    vars.onComplete = function() {
                        deferred.resolve();
                    };

                    TweenMax.to(element, duration, vars);

                    return deferred.promise;
                };

                return {
                    enter: enter,
                    leave: leave,
                    transitions: self.transitions,
                    defaults: self.defaults
                };
            }
        ];
    })

    .animation('.gsapify-router', ['gsapifyRouter',
        function(gsapifyRouter) {
            return {
                enter: function(element, done) {
                    element.css('visibility', 'hidden');

                    gsapifyRouter.enter(element).then(function() {
                        done();
                    });

                    return function(cancelled) {
                        if (!cancelled) {

                        }
                    };
                },
                leave: function(element, done) {
                    gsapifyRouter.leave(element).then(function() {
                        done();
                    });
                }
            };
        }
    ]);

})();
