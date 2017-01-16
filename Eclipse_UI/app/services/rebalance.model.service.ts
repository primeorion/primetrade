import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { HttpClient } from '../core/http.client';
import {IModelDetail} from '../models/modelDetail';

@Injectable()
export class RebalanceModelService {

    private _modelEndPoint = 'tempmodeling/models';

    constructor(private _httpClient: HttpClient) { }

    /**Get team Model data for auto complete */
    getModelSearch(searchString: string) {
        return this._httpClient.getData(this._modelEndPoint + '?search=' + searchString)
    }
    
    getModelData() {
        return this._httpClient.getData(this._modelEndPoint);
    }
    updateModel(model: IModelDetail){
          return this._httpClient.postData(this._modelEndPoint, model);
         //return this._httpClient.updateData(this._securityEndPoint + "/" + security.id, security);
    }
    
    getModelDetail(id) {
         return this._httpClient.getData(this._modelEndPoint + "/" + id);
    }

}
