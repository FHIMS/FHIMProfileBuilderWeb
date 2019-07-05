import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { toODataString } from '@progress/kendo-data-query';
import { baseURL } from './properties';
import { errorMessage } from '../actions/notifications';
export class StructureDefinitionsLoader extends React.Component {
    
   
    init = { method: 'GET', accept: 'application/json;charset=utf-8', headers: {} };
    lastSuccess = '';
    pending = '';
    filter = '';
    searchBy = '';
    sortColumn='name';
    sortDir=''

    initData = (searchBy, sortColumn, sortDir) =>
    {
        this.lastSuccess = '';
        this.pending = '';
        this.filter = '';
        this.searchBy = searchBy;
        this.sortColumn = sortColumn;
        this.sortDir = sortDir;
    }

    buildQuery = (searchBy, sortColumn, sortDir) =>
    {
        return  baseURL + '?name:contains='+searchBy + '&_sort='+sortDir+sortColumn;
    }

    getChunck = (queryDefinition, dataState, sortColumn, sortDir) =>
    {
        const endpoint =
          baseURL + '?_getpages='+queryDefinition.transactionId+
                    '&_getpagesoffset=' + dataState.skip+
                    '&_count='+dataState.take+
                    '&_sort='+sortDir+sortColumn+
                    '&_pretty=true'+
                    '&_bundletype=searchset';
        return endpoint;
    }

    requestDataIfNeeded = () => {

        let searchBy = this.props.queryDefinition.searchBy;
        let sortColumn = this.props.sortColumn;
        let sortDir = this.props.sortDir;
        

         const s = this.props.sort[0].field;
         let dir = this.props.sort[0].dir;
        

         if(s.length > 0)
         {                 
                const field = s.split('.');
                sortColumn = field[field.length-1];
                if(dir === 'desc')
                {
                    sortDir= "-";
                }
                else
                {
                    sortDir= "";
                }
               
                                        
        }
    

        if(!searchBy)
        {
            // console.log("Data Request If Needed SearchBy not Defined, local: "+this.searchBy);
            searchBy = this.searchBy;
        }
               
        let url = this.buildQuery(searchBy, sortColumn, sortDir);
        
        
        if( (searchBy !== '' && searchBy !== this.searchBy) || 
            (sortColumn !== this.sortColumn) ||
            ( sortDir !== this.sortDir))
        {
            this.initData(searchBy, sortColumn, sortDir);
           
            console.log("New Query: "+url);
        }
        else if (this.pending || toODataString(this.props.dataState) === this.lastSuccess) {
            
              /*   console.log("No Query: " +
                  this.pending + " Last Success: "+this.lastSuccess + " TransactionId: "
                 + transactionId + " Serach By: "+searchBy);
              */
                 return;
        }
        else {
            url = this.getChunck(this.props.queryDefinition, this.props.dataState, sortColumn, sortDir);
            console.log("Chunck Query: "+url);
        }
        
        this.pending = toODataString(this.props.dataState);
        
        
        fetch(url, this.init)
            .then(response => response.json())
            .then(json => {

                this.lastSuccess = this.pending;
                this.pending = '';
               
                if (toODataString(this.props.dataState) === this.lastSuccess) {
                 
                    this.props.onDataRecieved.call(undefined, {
                        data: json.entry,
                        total: json['total'],
                        transactionId: json['id']
                    });
                    this.transactionId = json['id'];
                }
                else {
                  
                    console.log("CALL requestDataIfNeeded");
                    this.requestDataIfNeeded();
                }
            })
            .catch(function (error) {
                errorMessage("Structure Definition Query Failed: " + error + ", URL: " +  url);

            })

    }

    render() {
        this.requestDataIfNeeded();

        return this.pending && <LoadingPanel />;
    }
}


class LoadingPanel extends React.Component {
    render() {
        const loadingPanel = (
            <div class="k-loading-mask">
                <span class="k-loading-text">Loading</span>
                <div class="k-loading-image"></div>
                <div class="k-loading-color"></div>
            </div>
        );

        const gridContent = document && document.querySelector('.k-grid-content');
        return gridContent ? ReactDOM.createPortal(loadingPanel, gridContent) : loadingPanel;
    }
}


const mapStateToProps = (state, props) => ({
   
});

const mapDispatchToProps = (dispatch, props) => ({
 
});

export default connect(mapStateToProps, mapDispatchToProps)(StructureDefinitionsLoader);