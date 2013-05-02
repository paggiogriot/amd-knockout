﻿define(['knockout',
        'underscore',
        'viewModels/TableViewModel',
        'models/CreditCard',
        'data/cardsRepository',
        'data/savingsRepository',
        'shared/messageBus'],
    function (ko, _, TableViewModel, CreditCard, cardsRepository, savingsRepository, messageBus) {

        var TableController = function (options) {
            var self = this;
            options = options || {};
            
            self.cardsOptions = { calculatorParameters: null };
            self.initialize.call(self, options);
        };
        
        _.extend(TableController.prototype, {
            initialize: function (options) {
                var self = this;

                self.viewModel = new TableViewModel(options);
                self.setupSubscriptions.call(self);
                self.updateCards.call(self);
            },
            
            setupSubscriptions: function () {
                var self = this;

                messageBus.data.subscribe('category.changed', function (category) {
                    self.viewModel.selectedCategory(category);
                    self.viewModel.sortBy('DisplayOrder');
                    self.viewModel.sortByDirection('asc');
                    self.updateCards.call(self);
                });

                messageBus.data.subscribe('calculator.update', function (calculatorParameters) {
                    self.cardsOptions.calculatorParameters = calculatorParameters;
                    self.viewModel.sortBy('SavingAmount');
                    self.viewModel.sortByDirection('desc');
                    self.updateCards.call(self);
                });

                messageBus.data.subscribe('table.sort', function (viewModel) {
                    self.viewModel.sortBy(viewModel.sortBy());
                    self.viewModel.sortByDirection(viewModel.sortByDirection());
                    self.updateCards.call(self);
                });
            },
            
            sortByBalanceTransfer: function (data, e) {
                var self = this;

                self.sortBy('DurationofBalRateM');
                self.sortByDirection('desc');

                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },

            sortByBalanceTransferFee: function (data, e) {
                var self = this;

                self.sortBy('IntroBalanceTfrFee');
                self.sortByDirection('asc');

                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },

            sortByPurchase: function (data, e) {
                var self = this;

                self.sortBy('DurationofPurchRateM');
                self.sortByDirection('desc');

                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },

            sortBySavings: function (data, e) {
                var self = this;

                self.sortBy('SavingAmount');
                self.sortByDirection('desc');
                
                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },

            sortByEligibility: function (data, e) {
                var self = this;

                self.sortBy('Score');
                self.sortByDirection('desc');
                
                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },

            sortByApr: function (data, e) {
                var self = this;

                self.sortBy('RepresentativeAPR');
                self.sortByDirection('asc');
                
                messageBus.data.publish({
                    topic: 'table.sort',
                    data: self
                });
            },
            
            updateCards: function() {
                var self = this;
                var cardsModel = [];

                self.cardsOptions.category = self.viewModel.selectedCategory();
                self.cardsOptions.sortBy = self.viewModel.sortBy();
                self.cardsOptions.sortByDirection = self.viewModel.sortByDirection();
                self.cardsOptions.pageSize = self.viewModel.pageSize();
                self.cardsOptions.currentPage = self.viewModel.currentPage();

                _.each(cardsRepository.getCards(self.cardsOptions), function (card) {
                    cardsModel.push(new CreditCard(card));
                });
                
                self.viewModel.cards(cardsModel);
            }
        });

        return TableController;
    });