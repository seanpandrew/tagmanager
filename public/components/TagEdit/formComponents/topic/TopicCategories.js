import React from 'react';
import {topicCategories} from '../../../../constants/topicCategories';

export default class TopicCategories extends React.Component {

  constructor(props) {
    super(props);

    this.isSelected = this.isSelected.bind(this);
    this.addCategory = this.addCategory.bind(this);
    this.removeCategory = this.removeCategory.bind(this);
  }

  removeCategory(category) {
    this.props.onChange(this.props.selectedCategories.filter(selectedCat => {
      return selectedCat !== category;
    }));
  }

  addCategory(category) {
    if (this.props.selectedCategories) {
      this.props.onChange(this.props.selectedCategories.concat([category]));
    } else {
      this.props.onChange([category]);
    }
  }

  onChecked(category) {
    if (this.isSelected(category)) {
      this.removeCategory(category);
    } else {
      this.addCategory(category);
    }
  }

  isSelected(category) {
    return !!this.props.selectedCategories && this.props.selectedCategories.indexOf(category) !== -1;
  }

  render () {

    return (
      <div>
        {topicCategories.map(category => {
          return (
            <span key={category}>
              <input type="checkbox" checked={this.isSelected(category)} onChange={this.onChecked.bind(this, category)}/>
              {category}
            </span>
          );
        })}
      </div>
    );
  }
}
