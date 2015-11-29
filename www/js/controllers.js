angular.module('ionicParseApp.controllers', [])

.controller('AppController', function($scope, $state, $rootScope, $ionicHistory, $stateParams) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }

    $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
        $state.go('app.login', {
            clear: true
        });
    };
})

.controller('HomeController', function($scope, $state, $rootScope, $ionicLoading) {
	$rootScope.cartAmount = 0;
	
	// Map display
	var WholesomeFoodsCoord = {lat: 40.5238207, lng: -74.4674582};
	var HmartCoord = {lat: 40.5242941, lng: -74.4658027};
	var TraderJoanCoord = {lat: 40.5248125, lng: -74.4693872};
	
	var map = new google.maps.Map(document.getElementById('map'), {
		zoom: 16,
		center: WholesomeFoodsCoord
	});

	var marker = new google.maps.Marker({
		position: WholesomeFoodsCoord,
		map: map,
		title: 'Wholesome Foods'
	});
	
	var marker2 = new google.maps.Marker({
		position: HmartCoord,
		map: map,
		title: 'Hmart'
	});
	
	var marker3 = new google.maps.Marker({
		position: TraderJoanCoord,
		map: map,
		title: 'Hmart'
	});

	$scope.map = map;
	
	// Store display
	var Stores = Parse.Object.extend("Stores");
	var query = new Parse.Query(Stores);
	stores = [];

	query.find({
		success: function(results) {
			$ionicLoading.hide();
			for (var i = 0; i < results.length; i++) {
				var object = results[i].attributes;
				stores.push(object);
			}
			$scope.stores = stores;
		},
		error: function(error) {
			$ionicLoading.hide();
			alert("Error: " + error.code + " " + error.message);
		}
	});
	
	// Get All Products
	var allProducts = Parse.Object.extend("Products");
	var query = new Parse.Query(allProducts);
	products = [];

	query.find({
		success: function(results) {
			$ionicLoading.hide();
			for (var i = 0; i < results.length; i++) {
				var object = results[i].attributes;
				products.push(object);
			}

			$rootScope.allProducts = products;
			console.log($rootScope.allProducts);
		},
		error: function(error) {
			$ionicLoading.hide();
			alert("Error: " + error.code + " " + error.message);
		}
	});
})

.controller('StoreController', function($scope, $state, $rootScope, $ionicLoading) {
	for (var i = 0; i < stores.length; i++) {
		if (stores[i].name === $state.params.storeName) {
			$scope.store = stores[i];
		}
	}
	
	// Get Products
	var Products = Parse.Object.extend("Products");
	var query = new Parse.Query(Products);
	query.equalTo("storeName", $scope.store.name);
	products = [];

	query.find({
		success: function(results) {
			$ionicLoading.hide();
			for (var i = 0; i < results.length; i++) {
				if(results[i].attributes.storeName === $scope.store.name) {
					var object = results[i].attributes;
					products.push(object);
				}
			}
			//$scope.products = products;
			$rootScope.products = products;
			
			var categories = [];
			$scope.groupedProducts = _.chain(products).groupBy('category').pairs().sortBy(0).value();
		},
		error: function(error) {
			$ionicLoading.hide();
			alert("Error: " + error.code + " " + error.message);
		}
	});
})

.controller('ProductController', function($scope, $state, $rootScope, $ionicLoading, $ionicPopup, $timeout) {
	// Get Products
	var Products = Parse.Object.extend("Products");
	var query = new Parse.Query(Products);
	query.equalTo("storeName", $state.params.storeName);
	query.equalTo("name", $state.params.productName);
	$scope.storeName = $state.params.storeName;
	
	query.find({
		success: function(results) {
			$ionicLoading.hide();
			var object = results[0].attributes;
			console.log(object);
			//$scope.product = object;
			$rootScope.product = object;
		},
		error: function(error) {
			$ionicLoading.hide();
			alert("Error: " + error.code + " " + error.message);
		}
	});
	
	$scope.increase = function() {
		for (var i = 0; i < $rootScope.products.length; i++) {
			if ($rootScope.products[i].name === $rootScope.product.name) {
				$rootScope.products[i].purchaseQuantity += 1;
				$rootScope.product.purchaseQuantity += 1;
			}
		}
	};
		
	$scope.decrease = function() {
		for (var i = 0; i < $rootScope.products.length; i++) {
			if ($rootScope.products[i].name === $rootScope.product.name && $rootScope.products[i].purchaseQuantity - 1 != 0) {
				$rootScope.products[i].purchaseQuantity -= 1;
				$rootScope.product.purchaseQuantity -= 1;
			}
		}
	};
	
	$scope.add = function() {
		var myPopup = $ionicPopup.show({
			title: 'Added'
		});
		$timeout(function() {
			myPopup.close(); //close the popup after 3 seconds for some reason
		}, 1000);
		 
		// Set special request
		if(document.getElementById('special').innerHTML != '') {
			for (var i = 0; i < $rootScope.products.length; i++) {
				if ($rootScope.products[i].name === $rootScope.product.name) {
					$rootScope.products[i].request = document.getElementById('special').innerHTML;
					$rootScope.product.request = document.getElementById('special').innerHTML;
				}
			}
		}
		
		// Add to cart
		var exists = false;
		var copyProducts = JSON.parse(JSON.stringify($rootScope.products));
		if($rootScope.cart.length > 0) {
			for(var j = 0; j < $rootScope.cart.length; j++) {
				if($rootScope.cart[j].name === $rootScope.product.name) {
					$rootScope.cart[j].request = $rootScope.product.request;
					$rootScope.cart[j].purchaseQuantity += $rootScope.product.purchaseQuantity;
					exists = true;
					$rootScope.cartAmount = $rootScope.getAmount();
				}
			}
			
			if(exists == false) {
				for (var i = 0; i < $rootScope.products.length; i++) {
					if ($rootScope.products[i].name === $rootScope.product.name) {
						$rootScope.cart.push(copyProducts[i]);
						$rootScope.cartAmount = $rootScope.getAmount();
					}
				}
			}
		}
		else {
			for (var i = 0; i < $rootScope.products.length; i++) {
				if ($rootScope.products[i].name === $rootScope.product.name) {
					$rootScope.cart.push(copyProducts[i]);
					$rootScope.cartAmount = $rootScope.getAmount();
				}
			}
		}
		
		console.log("cart");
		console.log($rootScope.cart);
	};
})

.controller('CartController', function($scope, $state, $rootScope, $ionicLoading) {
	$scope.setTime = function() {
		var e = document.getElementById("pickup");
		$rootScope.pickup = e.options[e.selectedIndex].text;
	};
	
	$scope.groupedPairs = _.chain($rootScope.cart).groupBy('storeName').pairs().sortBy(0).value();
	$rootScope.total = getTotal();
	
	function getTotal() {
		var total = 0;
		if($rootScope.cart.length > 0) {
			for(var i = 0; i < $rootScope.cart.length; i++) {
				total += $rootScope.cart[i].purchaseQuantity * $rootScope.cart[i].price;
			}
		}	
	
		return parseFloat(Math.round(total * 100) / 100).toFixed(2);
	};
	
	$scope.increase = function(item, storeName) {
		for (var i = 0; i < $rootScope.cart.length; i++) {
			if ($rootScope.cart[i].name === item && $rootScope.cart[i].storeName === storeName) {
				$rootScope.cart[i].purchaseQuantity += 1;
				$rootScope.total = getTotal();
				$rootScope.cartAmount = $rootScope.getAmount();
			}
		}
	};
			
	$scope.decrease = function(item, storeName) {
		for (var i = 0; i < $rootScope.cart.length; i++) {
			if ($rootScope.cart[i].name === item && $rootScope.cart[i].storeName === storeName && $rootScope.cart[i].purchaseQuantity - 1 != 0) {
				$rootScope.cart[i].purchaseQuantity -= 1;
				$rootScope.total = getTotal();
				$rootScope.cartAmount = $rootScope.getAmount();
			}
		}
	};
})

.controller('PaymentController', function($scope, $state, $rootScope, $ionicLoading, $ionicHistory, $ionicPopup) {
	$scope.submit = function(cart, total) {
		var alertPopup = $ionicPopup.alert({
			title: 'Order Submitted',
			template: 'Thanks for shopping with HopCart! Your order will be ready at {{pickup}}.'
		});
		
		// Order History
		var OrderHistory = Parse.Object.extend("OrderHistory");
		var order = new OrderHistory();
		order.set("customer", $scope.user.attributes.username);
		order.set("email", $scope.user.attributes.email);
		order.set("order", cart);
		order.set("pickupTime", $rootScope.pickup);
		order.set("total", total);
		order.save(null, {});
		
		// Recent Products
		for (var i = 0; i < $rootScope.cart.length; i++) {
			var exists = false;
			for (var j = 0; j < $rootScope.recentProducts.length; j++) {
				if($rootScope.cart[i].name == $rootScope.recentProducts[j].name) {
					exists = true;
				}
			}
			if(exists == false) {
				var RecentProducts = Parse.Object.extend("RecentProducts");
				var recent = new RecentProducts();
				recent.set("username", $scope.user.attributes.username);
				recent.set("name", $rootScope.cart[i].name);
				recent.set("storeName", $rootScope.cart[i].storeName);
				recent.set("price", $rootScope.cart[i].price);
				recent.set("purchaseQuantity", 1);
				recent.save(null, {});
			}
		}
		
		// Clear Cart
		$rootScope.cart = [];
		$rootScope.cartAmount = 0;
		$ionicHistory.nextViewOptions({
			disableBack: true
		});
		$state.go('app.home');
    };
})

.controller('ListController', function($scope, $state, $rootScope, $ionicLoading, $ionicPopup, $timeout) {
	if($scope.user != null) {	
		$scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });
		
		var RecentProducts = Parse.Object.extend("RecentProducts");
		var query = new Parse.Query(RecentProducts);
		query.equalTo("username", $scope.user.attributes.username);
		var products = [];
		query.find({
			success: function(results) {
				$ionicLoading.hide();
				for (var i = 0; i < results.length; i++) {
					var object = results[i].attributes;
					products.push(object);
				}
				$rootScope.recentProducts = products;
				$scope.groupedPairs = _.chain($rootScope.recentProducts).groupBy('storeName').pairs().sortBy(0).value();
				console.log($rootScope.recentProducts);
			},
			error: function(error) {
				$ionicLoading.hide();
				alert("Error: " + error.code + " " + error.message);
			}
		});
		
		$scope.increase = function(item, storeName) {
			for (var i = 0; i < $rootScope.recentProducts.length; i++) {
				if ($rootScope.recentProducts[i].name === item && $rootScope.recentProducts[i].storeName === storeName) {
					$rootScope.recentProducts[i].purchaseQuantity += 1;
				}
			}
		};
			
		$scope.decrease = function(item, storeName) {
			for (var i = 0; i < $rootScope.recentProducts.length; i++) {
				if ($rootScope.recentProducts[i].name === item && $rootScope.recentProducts[i].storeName === storeName && $rootScope.recentProducts[i].purchaseQuantity - 1 != 0) {
					$rootScope.recentProducts[i].purchaseQuantity -= 1;
				}
			}
		};
		
		$scope.add = function(item, storeName) {
			var myPopup = $ionicPopup.show({
				title: 'Added'
			});
			$timeout(function() {
				myPopup.close(); //close the popup after 3 seconds for some reason
			}, 1000);
			
			var exists = false;
			var copyProducts = JSON.parse(JSON.stringify($rootScope.allProducts));
			
			// Get updated purchase quantity
			for(var i = 0; i < $rootScope.recentProducts.length; i++) {
				if($rootScope.recentProducts[i].name === item && $rootScope.recentProducts[i].storeName === storeName) {
					var purchaseQuantity = $rootScope.recentProducts[i].purchaseQuantity;
				}
			}
			
			// Add to cart
			if($rootScope.cart.length > 0) {
				for(var i = 0; i < $rootScope.cart.length; i++) {
					if($rootScope.cart[i].name === item && $rootScope.cart[i].storeName === storeName) {
						$rootScope.cart[i].purchaseQuantity += purchaseQuantity;
						exists = true;
						$rootScope.cartAmount = $rootScope.getAmount();
					}
				}
				
				if(exists == false) {
					for (var i = 0; i < $rootScope.allProducts.length; i++) {
						if ($rootScope.allProducts[i].name === item && $rootScope.allProducts[i].storeName === storeName) {
							copyProducts[i].purchaseQuantity = purchaseQuantity;
							$rootScope.cart.push(copyProducts[i]);
							$rootScope.cartAmount = $rootScope.getAmount();
						}
					}
				}
			}
			else {
				for (var i = 0; i < $rootScope.allProducts.length; i++) {
					if ($rootScope.allProducts[i].name === item && $rootScope.allProducts[i].storeName === storeName) {
						copyProducts[i].purchaseQuantity = purchaseQuantity;
						$rootScope.cart.push(copyProducts[i]);
						$rootScope.cartAmount = $rootScope.getAmount();
					}
				}
			}
			
			console.log("cart");
			console.log($rootScope.cart);
		};
	}
})

.controller('DetailsController', function($scope, $state, $rootScope, $ionicLoading) {
	for (var i = 0; i < stores.length; i++) {
		if (stores[i].name === $state.params.storeName) {
			$scope.store = stores[i];
		}
	}
})

.controller('PromotionsController', function($scope, $state, $rootScope, $ionicLoading) {
	$scope.promotions = [];
	for (var i = 0; i < $rootScope.allProducts.length; i++) {
		if ($rootScope.allProducts[i].originalPrice != null) {
			$scope.promotions.push($rootScope.allProducts[i]);
		}
	}
	console.log($scope.promotions);
	$scope.groupedPairs = _.chain($scope.promotions).groupBy('storeName').pairs().sortBy(0).value();
})

.controller('LoginController', function($scope, $state, $rootScope, $ionicLoading, $ionicHistory) {
    $scope.user = {
        username: null,
		email: null,
        password: null
    };

    $scope.error = {};

    $scope.login = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = $scope.user;
        Parse.User.logIn(('' + user.username).toLowerCase(), user.password, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, err) {
                $ionicLoading.hide();
                // The login failed. Check error to see why.
                if (err.code === 101) {
                    $scope.error.message = 'Invalid login credentials';
                } else {
                    $scope.error.message = 'An unexpected error has ' +
                        'occurred, please try again.';
                }
                $scope.$apply();
            }
        });
    };

    $scope.forgot = function() {
        $state.go('app.forgot');
    };
})

.controller('ForgotPasswordController', function($scope, $state, $ionicLoading) {
    $scope.user = {};
    $scope.error = {};
    $scope.state = {
        success: false
    };

    $scope.reset = function() {
        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        Parse.User.requestPasswordReset($scope.user.email, {
            success: function() {
                // TODO: show success
                $ionicLoading.hide();
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                $ionicLoading.hide();
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    };

    $scope.login = function() {
        $state.go('app.login');
    };
})

.controller('RegisterController', function($scope, $state, $ionicLoading, $rootScope) {
    $scope.user = {};
    $scope.error = {};

    $scope.register = function() {

        // TODO: add age verification step

        $scope.loading = $ionicLoading.show({
            content: 'Sending',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 0
        });

        var user = new Parse.User();
        user.set("username", $scope.user.username);
		user.set("email", $scope.user.email);
        user.set("password", $scope.user.password);
		
		console.log('register ' + $scope.user.username);
		console.log('register ' + $scope.user.password);
		
        user.signUp(null, {
            success: function(user) {
                $ionicLoading.hide();
                $rootScope.user = user;
                $rootScope.isLoggedIn = true;
                $state.go('app.home', {
                    clear: true
                });
            },
            error: function(user, error) {
                $ionicLoading.hide();
                if (error.code === 125) {
                    $scope.error.message = 'Please specify a valid email ' +
                        'address';
                } else if (error.code === 202) {
                    $scope.error.message = 'The email address is already ' +
                        'registered';
                } else {
                    $scope.error.message = error.message;
                }
                $scope.$apply();
            }
        });
    };
})

.controller('MainController', function($scope, $state, $rootScope, $stateParams, $ionicHistory) {
    if ($stateParams.clear) {
        $ionicHistory.clearHistory();
    }

    $scope.rightButtons = [{
        type: 'button-positive',
        content: '<i class="icon ion-navicon"></i>',
        tap: function(e) {
            $scope.sideMenuController.toggleRight();
        }
    }];

    /*$scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = null;
        $rootScope.isLoggedIn = false;
        $state.go('welcome', {
            clear: true
        });
    };*/

    $scope.toggleMenu = function() {
        $scope.sideMenuController.toggleRight();
    };
});
