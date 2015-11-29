// Ionic Parse Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'ionicParseApp' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'ionicParseApp.controllers' is found in controllers.js
angular.module('ionicParseApp',
        [ 'ionic', 'ionicParseApp.controllers' ]
    )
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('app', {
                url: '/app?clear',
                abstract: true,
                templateUrl: 'templates/menu.html',
                controller: 'AppController'
            })

            .state('app.home', {
                url: '/home',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/home.html',
                        controller: 'HomeController'
                    }
                }
            })

			.state('app.store', {
                url: '/store/:storeName',
				views: {
					'menuContent': {
						templateUrl: 'templates/store.html',
						controller: 'StoreController'
					}
				}
            })
			
			.state('app.details', {
                url: '/details/:storeName',
				views: {
					'menuContent': {
						templateUrl: 'templates/details.html',
						controller: 'DetailsController'
					}
				}
            })
			
			.state('app.promos', {
                url: '/promotions',
				views: {
					'menuContent': {
						templateUrl: 'templates/promotions.html',
						controller: 'PromotionsController'
					}
				}
            })
			
			.state('app.product', {
                url: '/:storeName/:productName',
				views: {
					'menuContent': {
						templateUrl: 'templates/product.html',
						controller: 'ProductController'
					}
				}
            })
			
			.state('app.cart', {
                url: '/cart',
				views: {
					'menuContent': {
						templateUrl: 'templates/cart.html',
						controller: 'CartController'
					}
				}
            })
			
			.state('app.payment', {
                url: '/payment',
				views: {
					'menuContent': {
						templateUrl: 'templates/payment.html',
						controller: 'PaymentController'
					}
				}
            })
			
            .state('app.login', {
                url: '/login',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/login.html',
                        controller: 'LoginController'
                    }
                }
            })
			
			.state('app.list', {
                url: '/list',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/list.html',
                        controller: 'ListController'
                    }
                }
            })

            .state('app.forgot', {
                url: '/forgot',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/forgotPassword.html',
                        controller: 'ForgotPasswordController'
                    }
                }
            })

            .state('app.register', {
                url: '/register',
                views: {
                    'menuContent': {
                        templateUrl: 'templates/register.html',
                        controller: 'RegisterController'
                    }
                }
            });

        $urlRouterProvider.otherwise('/app/home');
    })
    .run(function ($state, $rootScope) {		
        Parse.initialize("ka0MyhNum0qnLa5KsznOzcOhfwEyy9zaJbVFXGHW", "1mwhZ5nsga9fWwHbZn9iqw443JHSzlSTMvV5SCFM");
        var currentUser = Parse.User.current();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            $state.go('app.home');
        }
		
		// Global variables
		$rootScope.allProducts = [];
		$rootScope.products = [];
		$rootScope.product = [];
		$rootScope.cart = [];
		$rootScope.cartAmount = "";
		$rootScope.pickup = "";
		$rootScope.total = "";
		$rootScope.recentProducts = [];
		
		// Global functions
		$rootScope.getAmount = function() {
			var cartAmount = 0;
			for(var i = 0; i < $rootScope.cart.length; i++) {
				cartAmount += $rootScope.cart[i].purchaseQuantity;
			}
			
			return cartAmount;
		}
    });

