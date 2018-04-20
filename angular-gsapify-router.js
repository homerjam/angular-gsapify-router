/* global angular, TweenMax */

(function () {
  'use strict';

  /**
   * Name: angular-gsapify-router
   * Description: Angular UI-Router animation directive allowing configuration of state transitions using [GSAP](http://www.greensock.com/gsap-js/)
   * Author: jameshomer85@gmail.com
   * Licence: MIT
   * Usage: http://github.com/homerjam/angular-gsapify-router
   */

  angular
    .module('hj.gsapifyRouter', ['ui.router', 'ngAnimate'])

    .provider('gsapifyRouter', function () {
      var self = this;

      self.transitions = {};

      self.transitions.above = {
        duration: 1,
        ease: 'Quart.easeInOut',
        css: {
          y: '-100%',
        },
      };

      self.transitions.below = {
        duration: 1,
        ease: 'Quart.easeInOut',
        css: {
          y: '100%',
        },
      };

      self.transitions.left = {
        duration: 1,
        ease: 'Quint.easeInOut',
        css: {
          x: '-100%',
        },
      };

      self.transitions.right = {
        duration: 1,
        ease: 'Quint.easeInOut',
        css: {
          x: '100%',
        },
      };

      self.transitions.fade = {
        duration: 0.5,
        css: {
          opacity: 0,
        },
      };

      self.transitions.fadeDelayed = {
        duration: 0.5,
        delay: 0.5,
        css: {
          opacity: 0,
        },
      };

      self.transitions.none = {
        duration: 0,
        css: {},
      };

      self.defaults = {
        enter: 'none',
        leave: 'none',
      };

      self.transition = function (transitionName, transitionOptions) {
        self.transitions[transitionName] = transitionOptions;
      };

      self.scrollRecallEvent = 'leaveSuccess';

      self.$get = [
        '$rootScope',
        '$state',
        '$document',
        '$injector',
        '$window',
        '$timeout',
        '$q',
        '$log',
        function (
          $rootScope,
          $state,
          $document,
          $injector,
          $window,
          $timeout,
          $q,
          $log
        ) {
          var getOpts = function (state, view, enterLeave, inOut) {
            var opts = {
              transition: self.defaults[inOut === 'in' ? 'enter' : 'leave'],
              priority: 0,
            };

            if (
              state.data &&
              state.data['gsapifyRouter.' + view] &&
              state.data['gsapifyRouter.' + view][enterLeave]
            ) {
              var dataOpts =
                state.data['gsapifyRouter.' + view][enterLeave][inOut];

              if (dataOpts) {
                if (angular.isArray(dataOpts) || angular.isFunction(dataOpts)) {
                  opts = $injector.invoke(dataOpts);
                }

                if (angular.isObject(dataOpts)) {
                  opts = angular.extend(opts, dataOpts);
                  Object.keys(opts).forEach(function (key) {
                    if (
                      angular.isArray(opts[key]) ||
                      angular.isFunction(opts[key])
                    ) {
                      opts[key] = $injector.invoke(opts[key]);
                    }
                  });
                }

                if (angular.isString(dataOpts)) {
                  opts.transition = dataOpts;
                }
              }
            }

            return opts;
          };

          var getTransition = function (transition) {
            var result;

            if (angular.isObject(transition)) {
              result = transition;
            }

            if (angular.isString(transition)) {
              result = self.transitions[transition];

              if (angular.isArray(result) || angular.isFunction(result)) {
                result = $injector.invoke(result);
              }
            }

            return result;
          };

          var onMutate = function (element, done) {
            // try {
            //   var observer = new MutationObserver(function (mutations) {
            //     observer.disconnect();

            //     $window.requestAnimationFrame(function () {
            //       $timeout(done);
            //     });
            //   });

            //   observer.observe(element[0], {
            //     attributes: true,
            //     childList: false,
            //     characterData: false,
            //   });
            // } catch (error) {
            $timeout(done);
            // }
          };

          var enter = function (element) {
            var deferred = $q.defer();

            element.css('visibility', 'hidden');

            element.removeClass('gsapify-router-init');
            element.addClass('gsapify-router-in-setup');

            var view = element.attr('ui-view') || element.attr('data-ui-view');

            var current = $state.current;
            var previous = $state.previous;

            var currentOpts = getOpts(current, view, 'enter', 'in');
            var previousOpts = getOpts(previous, view, 'leave', 'in');

            var from;

            if (previousOpts.priority > currentOpts.priority) {
              from = previousOpts;
            } else {
              from = currentOpts;
            }

            var trigger =
              from.trigger || getOpts(previous, view, 'leave', 'out').trigger;

            var transition = getTransition(from.transition);

            if (!transition) {
              return $log.error('gsapifyRouter: Invalid transition \'' + transition + '\'');
            }

            var name = transition.name;
            var duration = transition.duration;
            var vars = angular.copy(transition);

            if (name) {
              element.attr('data-transition', name);
              delete vars.css;
            }

            vars.onStart = function () {
              element.css('visibility', 'visible');

              element.removeClass('gsapify-router-in-setup');
              element.addClass('gsapify-router-in');
            };

            vars.onComplete = function () {
              element.addClass('gsapify-router-in-end');
              element.removeAttr('data-transition');

              deferred.resolve({
                element: element,
                view: view,
              });
            };

            function go() {
              if (
                !vars.css ||
                Object.keys(vars.css).length === 0 ||
                duration === 0
              ) {
                onMutate(element, function () {
                  vars.onStart();

                  onMutate(element, function () {
                    vars.onComplete();
                  });
                });

                return;
              }

              TweenMax.from(element, duration, vars);
            }

            if (trigger) {
              var triggerEvent = $rootScope.$on(trigger, function () {
                triggerEvent();

                go();
              });
            } else {
              go();
            }

            return deferred.promise;
          };

          var leave = function (element) {
            var deferred = $q.defer();

            element.removeClass('gsapify-router-in gsapify-router-in-end');
            element.addClass('gsapify-router-out-setup');

            var view = element.attr('ui-view') || element.attr('data-ui-view');

            var current = $state.current;
            var previous = $state.previous;

            var previousOpts = getOpts(previous, view, 'leave', 'out');
            var currentOpts = getOpts(current, view, 'enter', 'out');

            var to;

            if (currentOpts.priority > previousOpts.priority) {
              to = currentOpts;
            } else {
              to = previousOpts;
            }

            var trigger =
              to.trigger || getOpts(current, view, 'enter', 'in').trigger;

            var transition = getTransition(to.transition);

            if (!transition) {
              return $log.error('gsapifyRouter: Invalid transition \'' + transition + '\'');
            }

            var name = transition.name;
            var duration = transition.duration;
            var vars = angular.copy(transition);

            if (name) {
              element.attr('data-transition', name);
              delete vars.css;
            }

            vars.onStart = function () {
              element.removeClass('gsapify-router-out-setup');
              element.addClass('gsapify-router-out');
            };

            vars.onComplete = function () {
              element.remove();

              deferred.resolve({
                element: element,
                view: view,
              });
            };

            function go() {
              if (
                !vars.css ||
                Object.keys(vars.css).length === 0 ||
                duration === 0
              ) {
                onMutate(element, function () {
                  vars.onStart();

                  onMutate(element, function () {
                    vars.onComplete();
                  });
                });

                return;
              }

              TweenMax.to(element, duration, vars);
            }

            if (trigger) {
              var triggerEvent = $rootScope.$on(trigger, function () {
                triggerEvent();

                go();
              });
            } else {
              go();
            }

            return deferred.promise;
          };

          return {
            enter: enter,
            leave: leave,
            transitions: self.transitions,
            defaults: self.defaults,
            scrollRecallEvent: self.scrollRecallEvent,
          };
        },
      ];
    })

    .config([
      '$stateProvider',
      function ($stateProvider) {
        $stateProvider.state('gsapifyRouterBlankState', {});
      },
    ])

    .run([
      '$state',
      '$transitions',
      function ($state, $transitions) {
        $state.history = [];
        $state.previous = {};

        $transitions.onSuccess({}, function (transition) {
          $state.previous = transition.$from();
          $state.previousParams = transition.$from().params;
          $state.history.push({
            name: transition.$from().name,
            params: transition.$from().params,
          });
        });
      },
    ])

    .directive('gsapifyRouter', [
      '$state',
      '$timeout',
      function ($state, $timeout) {
        return {
          priority: 0,
          restrict: 'C',
          link: function ($scope, $element, $attrs) {
            $attrs.$set('data-state', $state.current.name);

            $timeout(function () {
              $element.addClass('gsapify-router-init');
            });
          },
        };
      },
    ])

    .service('scrollRecallService', [
      '$rootScope',
      '$window',
      '$state',
      'gsapifyRouter',
      '$transitions',
      function ($rootScope, $window, $state, gsapifyRouter, $transitions) {
        var service = {
          view: null,
        };

        var getCurrentStateKey = function () {
          var currentState = {
            name: $state.current.name,
            params: $state.params,
          };

          return JSON.stringify(currentState);
        };

        var scrollMap = {};
        var currentStateKey = getCurrentStateKey();

        $transitions.onStart({}, function (transition) {
          if (!service.view) {
            return;
          }

          scrollMap[currentStateKey] = {
            x: $window.scrollX,
            y: $window.scrollY,
          };
        });

        $transitions.onSuccess({}, function (transition) {
          if (!service.view) {
            return;
          }

          currentStateKey = getCurrentStateKey();
        });

        $rootScope.$on(
          'gsapifyRouter:' + gsapifyRouter.scrollRecallEvent,
          function (event, element) {
            if (!service.view) {
              return;
            }

            var view = element.attr('ui-view') || element.attr('data-ui-view');

            if (view === service.view) {
              var prevState = $state.history[$state.history.length - 2];

              if (prevState) {
                var prevStateKey = JSON.stringify(prevState);

                if (
                  scrollMap[prevStateKey] &&
                  currentStateKey === prevStateKey
                ) {
                  $window.scrollTo(
                    scrollMap[prevStateKey].x,
                    scrollMap[prevStateKey].y
                  );
                  return;
                }
              }

              $window.scrollTo(0, 0);
            }
          }
        );

        return service;
      },
    ])

    .directive('scrollRecall', [
      'scrollRecallService',
      function (scrollRecallService) {
        return {
          priority: 0,
          restrict: 'A',
          link: function ($scope, $element, $attrs) {
            scrollRecallService.view = $attrs.uiView;
          },
        };
      },
    ])

    .animation('.gsapify-router', [
      '$rootScope',
      'gsapifyRouter',
      function ($rootScope, gsapifyRouter) {
        return {
          enter: function (element, done) {
            var state = element.attr('data-state');

            if (state !== 'gsapifyRouterBlankState') {
              $rootScope.$broadcast('gsapifyRouter:enterStart', element);

              gsapifyRouter.enter(element).then(function (obj) {
                $rootScope.$broadcast(
                  'gsapifyRouter:enterSuccess',
                  element,
                  obj
                );

                done();
              });
            }

            return function (cancelled) {
              // Backwards compatibility with angular 1.3.x and below
              if (angular.version.major === 1 && angular.version.minor <= 3) {
                if (cancelled === true) {
                  element.remove();
                }

                return;
              }

              if (cancelled !== false) {
                element.remove();
              }
            };
          },
          leave: function (element, done) {
            var state = element.attr('data-state');

            if (state !== 'gsapifyRouterBlankState') {
              $rootScope.$broadcast('gsapifyRouter:leaveStart', element);
              gsapifyRouter.leave(element).then(function (obj) {
                $rootScope.$broadcast(
                  'gsapifyRouter:leaveSuccess',
                  element,
                  obj
                );

                done();
              });
            }
          },
        };
      },
    ]);
}());
