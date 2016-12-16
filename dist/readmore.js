'use strict';

readMore.$inject = ["$templateCache"];
angular
	.module('hm.readmore', ['ngAnimate', 'ngSanitize'])
	.directive('hmReadMore', readMore);

/** @ngInject */
function readMore($templateCache) {
	hmReadMoreController.$inject = ["$filter", "$scope"];
	var directive = {
		restrict: 'AE',
		scope: {
			hmText: '@',
			hmLimit: '@',
			hmMoreText: '@',
			hmLessText: '@',
			hmDotsClass: '@',
			hmLinkClass: '@'
		},
		template: $templateCache.get('readmore.template.html'),
		controller: hmReadMoreController,
		controllerAs: 'vm',
		bindToController: true
	};

	return directive;

	/** @ngInject */
	// "bindToController: true" binds scope variables to Controller
	function hmReadMoreController($filter, $scope) {
		var limit = 0;
		var vm = this;
		vm.toggle = {
			dots: '...',
			dotsClass: vm.hmDotsClass,
			linkClass: vm.hmLinkClass
		}

		// Toggle functions
		function setToggleMoreText() {
			vm.toggle.moreText = vm.hmMoreText || 'Read more';
		}

		function setToggleLessText() {
			vm.toggle.lessText = vm.hmLessText || 'Read less';
		}

		function setCurrentToggleText() {
			vm.toggle.text = vm.toggle.state ? vm.toggle.lessText : vm.toggle.moreText;
		}

		function setShowToggle() {
			vm.toggle.show = limit <= 0;
		}

		vm.doToggle = function () {
			vm.toggle.state = !vm.toggle.state;
			vm.showMoreText = !vm.showMoreText;
			setCurrentToggleText();
		}

		$scope.$watch('vm.hmMoreText', function (newValue, oldValue) {
			if (newValue != oldValue) {
				setToggleMoreText();
				setCurrentToggleText();
			}
		});

		$scope.$watch('vm.hmLessText', function (newValue, oldValue) {
			if (newValue != oldValue) {
				setToggleLessText();
				setCurrentToggleText();
			}
		});

		$scope.$watch('vm.hmDotsClass', function (newValue, oldValue) {
			if (newValue != oldValue) {
				vm.toggle.dotsClass = vm.hmDotsClass;
			}
		});

		$scope.$watch('vm.hmLinkClass', function (newValue, oldValue) {
			if (newValue != oldValue) {
				vm.toggle.linkClass = vm.hmLinkClass;
			}
		});

		// ----------

		// If negative number, set to undefined
		function validateLimit() {
			vm.hmLimit = (vm.hmLimit && vm.hmLimit <= 0) ? undefined : vm.hmLimit;
			limit = vm.hmLimit;
		}

		function getMoreTextLimit() {
			return vm.hmLimit && vm.hmLimit < vm.hmText.length ? vm.hmLimit - vm.hmText.length : 0;
		}

		function setLessAndMoreText() {
			
		  var htmlParser = new DOMParser()
		  var xhtml = htmlParser.parseFromString(vm.hmText,"text/html");
			xhtml = xhtml.querySelector("body")
			var myDom = cloneNode(xhtml);

			walk(xhtml, myDom, function (node) {
		    if (node.nodeType === 3) { 
		        var text = node.data.trim();
						return text.length;
		    }
		    return 0;
			})
			vm.lessText = myDom.innerHTML;
			vm.moreText = vm.hmText;
		}

		function initialize() {
			setToggleMoreText();
			setToggleLessText();
			validateLimit();
			setLessAndMoreText();
			setShowToggle();
			setCurrentToggleText();
		}

		function cloneNode(node){
			if (node.nodeType === 3) return	document.createTextNode(node.data);
			else return node.cloneNode()
		}

		function walk(node, myNode, callback) {
			node = node.firstChild;
		 	while (node != null) {
				myNode.appendChild(cloneNode(node))
				if ((limit = limit - callback(node)) <= 0){
		    		myNode.innerText = myNode.innerText.slice(0, limit)
		    		return false;
		    } 
		    else{
			  	if (walk(node, myNode.lastElementChild, callback) === false) {
		    		return false;
		    	}
			
		    }
				node = node.nextSibling;
			}
			return true
		}

		initialize();

		$scope.$watch('vm.hmText', function (newValue, oldValue) {
			if (newValue != oldValue) {
				validateLimit();
				setLessAndMoreText();
				setShowToggle();
			}
		});

		$scope.$watch('vm.hmLimit', function (newValue, oldValue) {
			if (newValue != oldValue) {
				validateLimit();
				setLessAndMoreText();
				setShowToggle();
			}
		});
	}
};

angular.module("hm.readmore").run(["$templateCache", function($templateCache) 
	{$templateCache.put("readmore.template.html",
		"<span name=\"text\">\n	<span ng-bind-html=\"vm.lessText\" ng-if=\"!vm.showMoreText\" style=\"white-space:pre-wrap;\"></span>\n	<span ng-show=\"vm.showMoreText\" class=\"more-show-hide\" ng-bind-html=\"vm.moreText\" style=\"white-space:pre-wrap;\"></span>\n</span>\n\n<span name=\"toggle\" ng-show=\"vm.toggle.show\">\n	<span ng-class=\"vm.toggle.dotsClass\" ng-show=\"!vm.toggle.state\">{{ vm.toggle.dots }}</span>\n	<a ng-class=\"vm.toggle.linkClass\" ng-click=\"vm.doToggle()\">{{ vm.toggle.text }}</a>\n</span>\n");}]);