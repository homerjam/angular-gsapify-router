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

                var getOpts = function(state, view, enterLeave, inOut) {
                    var opts = {
                        transition: self.defaults[inOut === 'in' ? 'enter' : 'leave'],
                        priority: 0
                    };

                    if (state.data) {
                        if (state.data['gsapifyRouter.' + view] && state.data['gsapifyRouter.' + view][enterLeave]) {
                            switch (typeof state.data['gsapifyRouter.' + view][enterLeave][inOut]) {
                                case 'object':
                                    opts = angular.extend(opts, state.data['gsapifyRouter.' + view][enterLeave][inOut]);
                                    break;
                                case 'string':
                                    opts.transition = state.data['gsapifyRouter.' + view][enterLeave][inOut];
                                    break;
                            }
                        }
                    }

                    return opts;
                };

                var enter = function(element) {
                    var deferred = $q.defer();

                    element.css('visibility', 'hidden');
                    element[0].classList.add('gsapify-router-in');

                    var view = element.attr('ui-view'),

                        current = $state.current,
                        previous = $state.previous,

                        currentOpts = getOpts(current, view, 'enter', 'in'),
                        previousOpts = getOpts(previous, view, 'leave', 'in'),

                        from;

                    element[0].setAttribute('data-state', current.name);

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

                    vars.onStart = function() {
                        element.css('visibility', 'visible');
                    };

                    vars.onComplete = function() {
                        deferred.resolve();
                    };

                    if (!vars.css || Object.keys(vars.css).length === 0) {
                        vars.onStart();
                    }

                    TweenMax.from(element, duration, vars);

                    return deferred.promise;
                };

                var leave = function(element) {
                    var deferred = $q.defer();

                    element[0].classList.remove('gsapify-router-in');
                    element[0].classList.add('gsapify-router-out');

                    var view = element.attr('ui-view'),

                        current = $state.current,
                        previous = $state.previous,

                        previousOpts = getOpts(previous, view, 'leave', 'out'),
                        currentOpts = getOpts(current, view, 'enter', 'out'),

                        to;

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
