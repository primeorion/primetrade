import { Component} from '@angular/core';
import { BaseComponent } from '../../../core/base.component';
import * as Util from '../../../core/functions';
import {Response} from '@angular/http';
import { ITabNav, OverviewTabNavComponent } from '../shared/overview.tabnav.component';
import { OverviewLeftNavComponent } from '../../../shared/leftnavigation/overview.leftnav.component';
import { OverviewBreadcrumbComponent } from '../../../shared/breadcrumb/overviewbreadcrumb';
import { DonutChartService } from '../../../services/donutchart.service';
import { LineChartService } from '../../../services/linechart.service';
import {OverviewService}  from '../../../services/overview.service';
import {IAumSummery,IAccountSummery,ICashFlowSummery} from '../../../models/overview'
import { ActivatedRoute }    from '@angular/router';

@Component({
    selector: 'community-model',
    templateUrl: './app/components/overview/model/model.component.html',
})
export class ModelComponent extends BaseComponent {
    private tabsModel: ITabNav;
    modelData: any[] = [];
    colorCodes: string[] = [];
    totalValue: number;
    totalPercent: number;
    selectedDate: string;
    type: string;
    percentChange: number;
    paramsSub: any;
    overtype: any;
    startDate: string;
    endDate: string;
    cashFlowSummery: any = [];
    cashFlowModelData: any[] = [];
    SelectedTimeFrame: string;
    dateRangeCheck: boolean = false;
    maxDateValue : Date = new Date();

    constructor(private _donutChartService: DonutChartService, private _overviewService: OverviewService,
        private activatedRoute: ActivatedRoute,private _lineChartService : LineChartService) {
        super();
        this.selectedDate = (new Date()).toLocaleDateString();
        this.endDate = this.selectedDate;
        this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
        this.tabsModel = <ITabNav>{};
        // this.paramsSub = Util.getRouteParam<string>(this.activatedRoute, 'overtype');
        this.activeRoute = Util.activeRoute(this.activatedRoute);
        console.log('activeRoute: ', this.activeRoute);
        if (this.activeRoute == "aummodel") {
            this.tabsModel.route = 'aum';
            this.getAumModelSummery("model", this.selectedDate);
        } else if (this.activeRoute == "accountsmodel") {
            this.tabsModel.route = 'accounts';
            this.getAccountModelSummery("model", this.selectedDate);
        } else {
            this.tabsModel.route = 'cashflow';
            this.SelectedTimeFrame = "Daily";
            this.getCashFlowModelSummery("model", this.startDate, this.endDate);
        }
    }
    ngOnInit() {
    }
    getAumModelSummery(type, date) {
        this._overviewService.getAumSummary(type, date)
            .map((response: Response) => <IAumSummery>response.json())
            .subscribe(model => {
                //this.aumSummaryData = model;
                this.totalValue = model.totalMarketValue;
                this.totalPercent = model.totalPercent;
                this.percentChange = model.percentChange;
                this.modelData = model.models;
                this.modelData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._donutChartService.renderDonutChart("#modelDonut", this.modelData, this.colorCodes, this.tabsModel.route);
            });
    }
    getAccountModelSummery(type, date) {
        this._overviewService.getAccountSummary(type, date)
            .map((response: Response) => <IAccountSummery>response.json())
            .subscribe(model => {
                this.totalValue = model.totalManagedAccount;
                this.totalPercent = model.totalPercent;
                //this.percentChange = model.percentChange;
                this.modelData = model.models;
                console.log("modelAccount", this.modelData);
                this.modelData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });
                this._donutChartService.renderDonutChart("#modelDonut", this.modelData, this.colorCodes, this.tabsModel.route);
            });
    }
    getCashFlowModelSummery(type, startDate, endDate) {
        this._overviewService.getCashFlowSummary(type, startDate, endDate)
            .map((response: Response) => <ICashFlowSummery>response.json())
            .subscribe(model => {
                this.cashFlowSummery = model;
                console.log("cashflow", this.cashFlowSummery);
                this.cashFlowModelData = model.models;
                this.cashFlowModelData.forEach((item) => {
                    item.color = this.getRandomColor();
                    this.colorCodes.push(item.color);
                });

                this._lineChartService.renderLineChart("#modelLineChart", this.cashFlowModelData, this.SelectedTimeFrame, this.colorCodes,'model');
            });
    }
    timeFrameOnChange(event) {
        if (event == "Custom") {
            this.dateRangeCheck = true;
        } else {
            this.dateRangeCheck = false;
        }
    }
    getModelDataByDate() {
        if (this.selectedDate && this.activeRoute == "aummodel") {
            this.colorCodes = [];
            this.getAumModelSummery("model", this.selectedDate);
        } else if (this.selectedDate && this.activeRoute == "accountsmodel") {
            this.colorCodes = [];
            this.getAccountModelSummery("model", this.selectedDate);
        } else if (this.startDate && this.endDate && this.activeRoute == "cashflowmodel") {
            this.colorCodes = [];
            if (this.SelectedTimeFrame == "Daily" || this.SelectedTimeFrame == "Weekly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setDate(new Date().getDate() - 30))).toLocaleDateString();
            }
            else if (this.SelectedTimeFrame == "Monthly" || this.SelectedTimeFrame == "Quarterly") {
                this.endDate = (new Date()).toLocaleDateString();
                this.startDate = new Date((new Date().setFullYear(new Date().getFullYear() - 1))).toLocaleDateString();
            }
            this.getCashFlowModelSummery("model", this.startDate, this.endDate);
        }
    }
}