import React from 'react';
import CapiClient from '../util/CapiClient';
import ContentList from './ContentList/ContentList';
import BatchTagStatus from './BatchTagStatus/BatchTagStatus';
import tagManagerApi from '../util/tagManagerApi';

const CAPI_PAGE_SIZE = 200;

export class BatchTag extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
          selectedContent: [],
        };

        this.capiClient = CapiClient(props.config.capiUrl, props.config.capiKey);
        this.searchContent = this.searchContent.bind(this)
    }

    searchFieldChange(e) {
      this.searchContent(e.target.value);
    }

    searchContent(searchString) {
      this.props.capiActions.searchCapi(this.capiClient, searchString, {
        'show-tags': 'all',
        'page-size': CAPI_PAGE_SIZE
      });
    }

    toggleContentSelected(content) {
      if (this.state.selectedContent.indexOf(content.id) === -1) {
        this.setState({
          selectedContent: this.state.selectedContent.concat([content.id])
        });
      } else {
        this.setState({
          selectedContent: this.state.selectedContent.filter(selectedContentId => selectedContentId !== content.id)
        });
      }
    }

    selectAllContent() {
      this.setState({
        selectedContent: this.props.capiSearch.results.map(content => content.id)
      });
    }

    deselectAllContent() {
      this.setState({
        selectedContent: []
      });
    }

    onAddTagToContentTop(tag) {
      this.performBatchTag(tag, 'addToTop');
    }

    onAddTagToContentBottom(tag) {
      this.performBatchTag(tag, 'addToBottom');
    }

    onRemoveTagFromContent(tag) {
      this.performBatchTag(tag, 'remove');
    }

    performBatchTag(tag, operation) {
      tagManagerApi.batchTag(this.state.selectedContent, tag.id, operation);
      this.setState({
        selectedContent: []
      });
    }

    renderTooManyResults() {

      if (!this.props.capiSearch.count || this.props.capiSearch.count <= CAPI_PAGE_SIZE) {
        return false;
      }

      return (
        <div className="batch-tag__error">
          Over {CAPI_PAGE_SIZE} results found, please refine the search.
        </div>
      );
    }

    renderSearchStatus() {

      if (this.props.capiSearch.fetchState !== 'FETCH_STATE_DIRTY') {
        return false;
      }

      return (
        <div className="batch-tag__info">
          Searching...
        </div>
      );
    }

    render () {
        return (
            <div className="batch-tag">
                <div className="batch-tag__filters">
                    <div className="batch-tag__filters__group">
                        <label>Search by name</label>
                        <input className="batch-tag__input" type="text" value={this.props.capiSearch.searchTerm || ''} onChange={this.searchFieldChange.bind(this)} />
                    </div>
                    <div className="batch-tag__filters__group">
                        <span className="batch-tag__filter--selectall" onClick={this.selectAllContent.bind(this)}>Select All</span>
                        <span className="batch-tag__filter--clear" onClick={this.deselectAllContent.bind(this)}>Clear Selection</span>
                    </div>
                </div>
                {this.renderSearchStatus()}
                {this.renderTooManyResults()}
                <div className="batch-tag__content">
                  <ContentList
                    content={this.props.capiSearch.results}
                    selectedContent={this.state.selectedContent}
                    contentClicked={this.toggleContentSelected.bind(this)} />
                </div>
                <div className="batch-tag__status">
                  <BatchTagStatus
                    selectedContent={this.state.selectedContent}
                    onAddTagToContentTop={this.onAddTagToContentTop.bind(this)}
                    onAddTagToContentBottom={this.onAddTagToContentBottom.bind(this)}
                    onRemoveTagFromContent={this.onRemoveTagFromContent.bind(this)}
                  />
                </div>
            </div>
        );
    }
}

//REDUX CONNECTIONS
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as searchCapi from '../actions/searchCapi';

function mapStateToProps(state) {
  return {
    config: state.config,
    capiSearch: state.capiSearch
  };
}

function mapDispatchToProps(dispatch) {
  return {
    capiActions: bindActionCreators(Object.assign({}, searchCapi), dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(BatchTag);
