var budgetController = (function(){
  var Expense = function(id, description, value, percentage){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  }

  Expense.prototype.calcPercentage = function(totalIcome){
    if(totalIcome > 0){
      this.percentage = Math.round((this.value/totalIcome * 100));
    }else{
      this.percentage = '---';
    }
  };

  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }

  var Income = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0
    },
    budget:0,
    percentageBudget: -1
  };

  var calculateTotalBudget = function(type){
    var sum = 0
    data.allItems[type].forEach(function(incexp){
       sum += incexp.value;
       data.totals[type] = sum;
    });
  };

  return {

    addItem: function(type, des, val){
      var newItem;
      var id;
      if(data.allItems[type].length > 0){
        id = data.allItems[type][data.allItems[type].length-1].id +1;
      }else{
        id = 0;
      }
      if(type == 'exp'){ 
        newItem = new Expense(id, des, val);
      }else{
        newItem = new Income(id, des, val);
      }
      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function(type, id){
      ids = data['allItems'][type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
      if(index !== -1){
        data['allItems'][type].splice(index, 1);
      }
    },

    getBudgetUpdate: function(){
      return {
        budget: data.budget,
        percentage: data.percentageBudget,
        income: data.totals.inc,
        expense: data.totals.exp
      } 
    },

    budgetCalculate: function(){
      var budget;
      calculateTotalBudget('exp');
      calculateTotalBudget('inc');
      data.totals['inc'] = data.totals['inc'];
      data.totals['exp'] = data.totals['exp'];
      data.budget = data.totals['inc'] - data.totals['exp'];
      data.percentageBudget = Math.round(data.totals['exp']/data.totals['inc']*100);
    },

    updatePercentageForEachExpense: function(){
      data.allItems['exp'].forEach(function(curr){
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function(){
      var allPercentage = data.allItems['exp'].map(function(curr){
        return curr.getPercentage();
      });
      return allPercentage;
    }
  }
})();

var uiController = (function(){
  var domStrings = {
    budgetDescription: '#budget-description',
    budgetValue: '#budget-value',
    addType: '.add-type',
    budgetAdd: '#budget-add',
    insertExpense: '#expense-column',
    insertIncome: '#income-column',
    budgetIncome: '#budget-income',
    budgetExpense: '#budget-expense',
    budegtPercentage: '#percentage',
    budget: '#budget',
    expInc: '.exp-inc',
    expensePercentage: '#expense-percentage',
    month: '#month',
    input: '.add-type'
  };

  var formatNumber = function(obj, type){
    var array, int, decimal;
    obj = Math.abs(obj).toFixed(2);
    array = obj.split('.');
    int = array[0];
    decimal = array[1];
    if(int.length > 3){
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length); 
    }
    return (type == 'exp' ? '-' : '+') + int +'.'+decimal;
  };

  var NodeListforEach = function(list, callback){
    for(i=0;i<list.length;i++){
      callback(list[i], i);
    }
  };

  return {
    getInput: function(){
      return {
        addDescription: document.querySelector(domStrings.budgetDescription).value,
        value: parseInt(document.querySelector(domStrings.budgetValue).value),//inc or exp
        expInc: document.querySelector(domStrings.addType).value
      }
    },

    addListItem: function(obj, type){
      var html, newHtml, element;
      if(type === 'exp'){
        element = domStrings.insertExpense;
        html = '<ul><li id="exp-%id%"><span>%budgetDescription%</span> <span>-%type%</span> <span id="expense-percentage"></span> <span>delete</span></li></ul>';
      }else if(type === 'inc'){
        element = domStrings.insertIncome;
        html = '<ul><li id="inc-%id%"><span>%budgetDescription%-</span> <span>%type%</span> <span>delete</span></li></ul>';
      }
      newHtml = html.replace('%id%', obj.id);
      console.log(newHtml);
      newHtml = newHtml.replace('%type%', formatNumber(obj.value, type));
      console.log(newHtml);
      newHtml = newHtml.replace('%budgetDescription%', obj.description);
      var el = document.createElement('div');
      el.innerHTML = newHtml;
      document.querySelector(element).insertAdjacentElement('beforeend', el);
    },

    deleteItem: function(item){
      var el = document.getElementById(item);
      el.parentNode.removeChild(el);
    },

    clearInputValues: function(){
      var input_fields, input_fields_array;
      input_fields = document.querySelectorAll(domStrings.budgetDescription+ ',' +domStrings.budgetValue); //this would return NodeList
      input_fields_array = Array.prototype.slice.call(input_fields); //it would bring copy and this will be pointed to input_fields
      input_fields_array.forEach(function(current, index, array){
        current.value = "";
      });
      input_fields_array[0].focus();
    },

    displayBudget: function(obj){
      document.querySelector(domStrings.budgetIncome).textContent = obj.income;
      document.querySelector(domStrings.budgetExpense).textContent  = obj.expense;
      document.querySelector(domStrings.budegtPercentage).textContent = obj.percentage;
      document.querySelector(domStrings.budget).textContent  = obj.budget;
      if(obj.percentage > 0){
        document.querySelector(domStrings.budegtPercentage).textContent  = obj.percentage + '%';
      }else{
        document.querySelector(domStrings.budegtPercentage).textContent  = '----';
      }
    },

    displayPercentages: function(percentages){
      var NodeList;
      NodeList = document.querySelectorAll(domStrings.expensePercentage);
      NodeListforEach(NodeList, function(current, index){
        if(percentages[i] > 0){
          current.textContent = percentages[i] + '%';
        }else{
          current.textContent = '---';
        }
      });
    },

    displayMonth : function(){
      var date, year, month;
      array = ['jan', 'feb', 'mar', 'april', 'may', 'june', 'july', 'august', 'sep', 'oct', 'nov', 'dec'];
      date = new Date();
      month = date.getMonth();
      year = date.getFullYear(); 
      document.querySelector(domStrings.month).textContent = year + ' ' + array[month];
    },

    changeEvent: function(){
      var feilds;
      feilds = document.querySelectorAll(  
        domStrings.budgetDescription + ',' + 
        domStrings.budgetValue + ',' +
        domStrings.addType
      );
      NodeListforEach(feilds, function(curr){
        curr.classList.toggle('red-focus');
      });
      document.querySelector(domStrings.budgetAdd).classList.toggle('color');
    },

    getDomStrings: function(){
      return domStrings;
    }

  };
})();

var controller = (function(budCntrl, cntrl){
  
  var setUpEventListener = function(){
    var dom = cntrl.getDomStrings();
    console.log(document.querySelector(dom.budgetAdd).addEventListener('click', cntrlItem));
    document.addEventListener('keypress', function(e){
      if(e.keyCode === 13){
        cntrlItem();
      }
    });
    document.querySelector(dom.expInc).addEventListener('click', cntrlDeleteItem);
    document.querySelector(dom.input).addEventListener('change', cntrl.changeEvent);
  };

  var updateBudget = function(){
    var budget;
    budCntrl.budgetCalculate();
    budget = budCntrl.getBudgetUpdate();
    cntrl.displayBudget(budget);
  };

  var cntrlDeleteItem = function(e){
    var itemId, splitId;
    itemId = e.target.parentNode;
    splitId = itemId.id.split('-');
    type = splitId[0];
    id   = parseInt(splitId[1]);
    // delete from the data structure
    budCntrl.deleteItem(type, id);
    // delete from ui
    cntrl.deleteItem(itemId.id);
    // update budget
    console.log('hello');
    updateBudget();
  };

  var calculatePercForObject = function(){
    var percentages;
    budCntrl.updatePercentageForEachExpense(); //calculate percentage for each object
    percentages = budCntrl.getPercentage();
    cntrl.displayPercentages(percentages);
  };

  var cntrlItem = function(){
    var input, newItem;
    input   = cntrl.getInput();
    if((input.addDescription.value != "") && !isNaN(input.value) && input.value > 0){
      newItem = budCntrl.addItem(input.expInc, input.addDescription, input.value);
      cntrl.addListItem(newItem, input.expInc);
      calculatePercForObject();
      cntrl.clearInputValues();
      updateBudget();
    }
  };

  return {
    init: function(){
      console.log('started application');
      cntrl.displayBudget({budget: 0,percentage: 0, income: 0, expense: 0});
      setUpEventListener(); 
      cntrl.displayMonth();
    }
  };
})(budgetController, uiController);

controller.init();