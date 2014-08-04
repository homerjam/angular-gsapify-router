/*

    Name: angular-gsapify-router
    Description: Angular UI-Router animation directive allowing configuration of state transitions using [GSAP](http://www.greensock.com/gsap-js/)
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

        self.transitions.slideAbove = {
            duration: 0.5,
            css: {
                y: '-100%'
            }
        };

        self.transitions.crossfade = {
            duration: 0.5,
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
                var enter = function(element, duration) {
                    var deferred = $q.defer();

                    var elementViewName = element.attr('ui-view'),
                        current = $state.current,
                        previous = $state.previous,
                        promises = [];

                    angular.forEach(current.views, function(currentView, currentViewName) {
                        if (currentViewName.indexOf('@') !== -1) {
                            currentViewName = currentViewName.substr(0, currentViewName.indexOf('@'));
                        }

                        if (elementViewName !== currentViewName) {
                            return false;
                        }

                        var currentIn = {
                            transition: self.defaults.enter,
                            priority: 0
                        };

                        if (currentView.enter && (currentView.enter.in || currentView.enter.incoming)) {
                            currentIn = currentView.enter.in || currentView.enter.incoming;
                        }

                        var previousIn = {
                            transition: self.defaults.enter,
                            priority: 0
                        };

                        angular.forEach(previous.views, function(previousView, previousViewName) {
                            if (previousViewName.indexOf('@') !== -1) {
                                previousViewName = previousViewName.substr(0, previousViewName.indexOf('@'));
                            }

                            if (previousViewName === currentViewName) {
                                if (previousView.leave && (previousView.leave.in || previousView.leave.incoming)) {
                                    previousIn = previousView.leave.in || previousView.leave.incoming;
                                }
                            }
                        });

                        var from;

                        if (previousIn.priority > currentIn.priority) {
                            from = self.transitions[previousIn.transition];

                            if (!from) {
                                $log.error("gsapifyRouter: Invalid transition '" + previousIn.transition + "'");
                            }

                        } else {
                            from = self.transitions[currentIn.transition];

                            if (!from) {
                                $log.error("gsapifyRouter: Invalid transition '" + currentIn.transition + "'");
                            }
                        }

                        var duration = from.duration,
                            vars = angular.copy(from);

                        vars.onComplete = function() {
                            transitionDeferred.resolve();
                        };

                        var transitionDeferred = $q.defer();

                        TweenMax.from(element, duration, vars);

                        promises.push(transitionDeferred.promise);
                    });

                    $q.all(promises).then(function() {
                        deferred.resolve();
                    });

                    return deferred.promise;
                };

                var leave = function(element, duration) {
                    var deferred = $q.defer();

                    var elementViewName = element.attr('ui-view'),
                        current = $state.current,
                        previous = $state.previous,
                        promises = [];

                    angular.forEach(previous.views, function(previousView, previousViewName) {
                        if (previousViewName.indexOf('@') !== -1) {
                            previousViewName = previousViewName.substr(0, previousViewName.indexOf('@'));
                        }

                        if (elementViewName !== previousViewName) {
                            return false;
                        }

                        var previousOut = {
                            transition: self.defaults.leave,
                            priority: 0
                        };

                        if (previousView.leave && (previousView.leave.out || previousView.leave.outgoing)) {
                            previousOut = previousView.leave.out || previousView.leave.outgoing;
                        }

                        var currentOut = {
                            transition: self.defaults.leave,
                            priority: 0
                        };

                        angular.forEach(current.views, function(currentView, currentViewName) {
                            if (currentViewName.indexOf('@') !== -1) {
                                currentViewName = currentViewName.substr(0, currentViewName.indexOf('@'));
                            }

                            if (currentViewName === previousViewName) {
                                if (currentView.enter && (currentView.enter.out || currentView.enter.outgoing)) {
                                    currentOut = currentView.enter.out || currentView.enter.outgoing;
                                }
                            }
                        });

                        var to;

                        if (currentOut.priority > previousOut.priority) {
                            to = self.transitions[currentOut.transition];

                            if (!to) {
                                $log.error("gsapifyRouter: Invalid transition '" + currentOut.transition + "'");
                            }

                        } else {
                            to = self.transitions[previousOut.transition];

                            if (!to) {
                                $log.error("gsapifyRouter: Invalid transition '" + previousOut.transition + "'");
                            }
                        }

                        var duration = to.duration,
                            vars = angular.copy(to);

                        vars.onComplete = function() {
                            transitionDeferred.resolve();
                        };

                        var transitionDeferred = $q.defer();

                        TweenMax.to(element, duration, vars);

                        promises.push(transitionDeferred.promise);
                    });

                    $q.all(promises).then(function() {
                        deferred.resolve();
                    });

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
