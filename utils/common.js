'use strict';
class CommonUtility{
  constructor(){
    this.sort = this.sort.bind(this);
  }

  sort(items, attribute){
    items.sort(function(a, b) { return a[attribute] - b[attribute]; });
  }
}

module.exports = new CommonUtility();
