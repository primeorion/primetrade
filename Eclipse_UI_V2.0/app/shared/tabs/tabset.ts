import { Component} from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'tab-set',
  template: `
 <style type="text/css">
  .hide-tab { display: none }
  .show-tab { display: inline }
</style>
    <ul class="nav nav-tabs">
      <li *ngFor="let tab of tabs" (click)="selectTab(tab)" [class.active]="tab.active" [ngClass]="tab.className">
        <a style="cursor:pointer" >{{tab.title}}</a>
      </li>
    </ul>
    <ng-content></ng-content>
  `,
  // <button type="button" class="btn btn-info btn-raised" (click)="deactivateAllTabsandActiveSelectedTab(2)">Select third tab</button>
})

export class TabSet {
  tabs: Tab[];
  activeTab: string;

  constructor() {
    this.tabs = [];

  }


  selectTab(tab) {
    this.activeTab = tab.name;
    _deactivateAllTabs(this.tabs);
    tab.active = true;
    function _deactivateAllTabs(tabs: Tab[]) {
      tabs.forEach(tab => tab.active = false);
    }
  }

  //navigate from dashboard Details link to details tab for any component for adding new user/team/role etc..
  navigatetocreatetabfromDashboard() {
    _deactivateAllTabs(this.tabs);
    // this.tabs[1].active = 'true';
    function _deactivateAllTabs(tabs: Tab[]) {
      // tabs.forEach(tab => tab.active = false);
      tabs.forEach(tab => {
        if (tab.active == false)
          tab.active = true;
        else
          tab.active = false;
      });
    }
  }


  //Assigning the Active class for selected tabs
  deactivateAllTabsandActiveSelectedTab(tabname) {
    this.tabs.forEach(tab => {
      if (tab.name == tabname)
        tab.active = true;
      else
        tab.active = false;
    });
  }


  /**
   * function to deactive the unchecked tab in Team Component.
   */
  deactiveselectedTab(tabname, tabclass) {
    this.tabs.forEach(tab => {
      if (tab.name == tabname) {
        tab.className = tabclass;
      }
      if (tab.className == tabclass) {
        tab.displaytabdiv = tabclass;
      }
    });
  }

  addTab(tab: Tab) {
    if (this.tabs.length === 0) {
      tab.active = true;
    }
    this.tabs.push(tab);
  }
}
