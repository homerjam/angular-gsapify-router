/*

    Name: angular-gsapify-router
    Description: Angular UI-Router animation directive allowing configuration of [GSAP](http://www.greensock.com/gsap-js/) state transitions based on priority
    Author: jameshomer85@gmail.com
    Licence: MIT
    Usage: http://github.com/homerjam/angular-gsapify-router

*/
(function() {
    'use strict';

    angular.module('hj.gsapifyRouter', ['ngAnimate'])

    .constant('TweenMax', TweenMax)

    .provider('gsapifyRouter', function() {
        var self = this;

        self.transitions = {};

        self.transitions.slideFromAbove = {
            active: {
                duration: 1,
                cssOrigin: {
                    y: '-100%'
                },
                cssEnd: {
                    y: '0%'
                }
            },
            inactive: {
                duration: 1,
                cssOrigin: {
                    y: '100%'
                },
                cssEnd: {
                    y: '0%'
                }
            }
        };

        self.transitions.crossfade = {
            active: {
                duration: 0.5,
                cssOrigin: {
                    opacity: 0
                },
                cssEnd: {
                    opacity: 1
                }
            },
            inactive: {
                duration: 0.5,
                cssOrigin: {
                    opacity: 0
                },
                cssEnd: {
                    opacity: 1
                }
            }
        };

        self.transitions.fade = {
            active: {
                duration: 0.5,
                delay: 0.5,
                cssOrigin: {
                    opacity: 0
                },
                cssEnd: {
                    opacity: 1
                }
            },
            inactive: {
                duration: 0.5,
                cssOrigin: {
                    opacity: 0
                },
                cssEnd: {
                    opacity: 1
                }
            }
        };

        self.transitions.none = {
            active: {
                duration: 0,
                cssOrigin: {},
                cssEnd: {}
            },
            inactive: {
                duration: 0,
                cssOrigin: {},
                cssEnd: {}
            }
        };

        self.default = {
            transition: 'none',
            priority: 0
        };

        self.transition = function(transitionName, transitionOptions) {
            self.transitions[transitionName] = transitionOptions;
        };

        self.$get = ['$rootScope', '$state', '$document', '$timeout', '$q', 'TweenMax',
            function($rootScope, $state, $document, $timeout, $q, TweenMax) {
                var enter = function(element, duration) {
                    var deferred = $q.defer();

                    var currentOptions = self.default,
                        previousOptions = self.default,
                        current = $state.current,
                        previous = $state.previous;

                    if (current.data) {
                        if (current.data.gsapifyRouter) {
                            currentOptions = current.data.gsapifyRouter;
                        }
                    }

                    if (previous.data) {
                        if (previous.data.gsapifyRouter) {
                            previousOptions = previous.data.gsapifyRouter;
                        }
                    }

                    var transition = currentOptions.priority >= previousOptions.priority ?
                        self.transitions[currentOptions.transition].active : self.transitions[previousOptions.transition].inactive;

                    var from = {}, to = {};

                    from.css = transition.cssOrigin;
                    to.css = transition.cssEnd;

                    to.delay = transition.delay || 0;

                    duration = duration !== undefined ? duration : transition.duration;

                    if (angular.equals(from.css, to.css) || Object.keys(to).length === 0) {
                        $timeout(deferred.resolve, duration * 1000);

                        return deferred.promise;
                    }

                    to.onComplete = function() {
                        deferred.resolve();
                    };

                    TweenMax.fromTo(element, duration, from, to);

                    return deferred.promise;
                };

                var leave = function(element, duration) {
                    var deferred = $q.defer();

                    var currentOptions = self.default,
                        previousOptions = self.default,
                        current = $state.current,
                        previous = $state.previous;

                    if (current.data) {
                        if (current.data.gsapifyRouter) {
                            currentOptions = current.data.gsapifyRouter;
                        }
                    }

                    if (previous.data) {
                        if (previous.data.gsapifyRouter) {
                            previousOptions = previous.data.gsapifyRouter;
                        }
                    }

                    var transition = previousOptions.priority >= currentOptions.priority ?
                        self.transitions[previousOptions.transition].active : self.transitions[currentOptions.transition].inactive;

                    var from = {}, to = {};

                    from.css = transition.cssEnd;
                    to.css = transition.cssOrigin;

                    to.delay = transition.delay || 0;

                    duration = duration !== undefined ? duration : transition.duration;

                    if (angular.equals(from.css, to.css) || Object.keys(to).length === 0) {
                        $timeout(deferred.resolve, duration * 1000);

                        return deferred.promise;
                    }

                    to.onComplete = function() {
                        deferred.resolve();
                    };

                    TweenMax.fromTo(element, duration, from, to);

                    return deferred.promise;
                };

                return {
                    enter: enter,
                    leave: leave,
                    transitions: self.transitions,
                    default: self.default
                };
            }
        ];
    })

    .animation('.gsapifyRouter', ['gsapifyRouter',
        function(gsapifyRouter) {
            return {
                enter: function(element, done) {
                    gsapifyRouter.enter(element).then(function(){
                        done();
                    });

                    return function(cancelled) {
                        if (!cancelled) {

                        }
                    };
                },
                leave: function(element, done) {
                    gsapifyRouter.leave(element).then(function(){
                        done();
                    });
                }
            };
        }
    ]);

})();
