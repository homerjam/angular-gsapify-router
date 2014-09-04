(function() {

    'use strict';

    angular.module('MainCtrl', []).controller('MainCtrl', ['$scope',
        function($scope) {

        }
    ]);

    angular.module('HomeCtrl', []).controller('HomeCtrl', ['$scope',
        function($scope) {

        }
    ]);

    angular.module('Page1Ctrl', []).controller('Page1Ctrl', ['$scope',
        function($scope) {

        }
    ]);

    angular.module('Page2Ctrl', []).controller('Page2Ctrl', ['$scope',
        function($scope) {

        }
    ]);

    angular.module('ExampleApp', ['ngAnimate', 'ui.router', 'mobile-angular-ui', 'hj.gsapifyRouter', 'MainCtrl', 'HomeCtrl', 'Page1Ctrl', 'Page2Ctrl'])

    .config(['$stateProvider', '$locationProvider', '$urlRouterProvider', 'gsapifyRouterProvider',
        function($stateProvider, $locationProvider, $urlRouterProvider, gsapifyRouterProvider) {

            gsapifyRouterProvider.defaults = {
                enter: 'slideRight',
                leave: 'slideLeft'
            };

            gsapifyRouterProvider.transition('slideAbove', {
                duration: 1,
                ease: 'Quart.easeInOut',
                css: {
                    y: '-100%'
                }
            });

            gsapifyRouterProvider.transition('slideBelow', {
                duration: 1,
                ease: 'Quart.easeInOut',
                css: {
                    y: '100%'
                }
            });

            gsapifyRouterProvider.transition('slideLeft', {
                duration: 1,
                ease: 'Quint.easeInOut',
                css: {
                    x: '-100%'
                }
            });

            gsapifyRouterProvider.transition('slideRight', {
                duration: 1,
                ease: 'Quint.easeInOut',
                delay: 0.5,
                css: {
                    x: '100%'
                }
            });

            gsapifyRouterProvider.transition('fadeIn', {
                duration: 0.5,
                delay: 0.5,
                css: {
                    opacity: 0,
                }
            });

            gsapifyRouterProvider.transition('fadeOut', {
                duration: 0.5,
                css: {
                    opacity: 0,
                }
            });

            gsapifyRouterProvider.transition('scaleDown', {
                duration: 0.5,
                css: {
                    scale: 0,
                    opacity: 0
                }
            });            

            // $locationProvider.html5Mode(true);

            $urlRouterProvider.otherwise("/");

            $stateProvider.state('home', {
                url: '/',
                views: {
                    main: {
                        templateUrl: 'example/home.html',
                        controller: 'HomeCtrl'
                    }
                },
                data: {
                    'gsapifyRouter.main': {
                        enter: {
                            in : {
                                transition: 'fadeIn',
                                priority: 1
                            },
                            out: {
                                transition: 'fadeOut',
                                priority: 1
                            }
                        }
                    }
                }
            });

            $stateProvider.state('page1', {
                url: '/page1',
                views: {
                    main: {
                        templateUrl: 'example/page1.html',
                        controller: 'Page1Ctrl'
                    }
                },
                data: {
                    'gsapifyRouter.main': {
                        leave: {
                            out: {
                                transition: 'scaleDown',
                                priority: 2
                            }
                        }
                    }
                }                
            });

            $stateProvider.state('page2', {
                url: '/page2',
                views: {
                    main: {
                        templateUrl: 'example/page2.html',
                        controller: 'Page2Ctrl'
                    }
                },
                data: {
                    'gsapifyRouter.main': {
                        enter: {
                            in : {
                                transition: 'slideAbove',
                                priority: 2
                            },
                            out: {
                                transition: 'slideBelow',
                                priority: 2
                            }
                        },
                        leave: {
                            out: {
                                transition: 'fadeOut',
                                priority: 1
                            },
                            in : {
                                transition: 'fadeIn',
                                priority: 1
                            }
                        }
                    }
                }
            });

        }
    ]);

})();
