import React, {Component} from 'react';
import * as apiCalls from '../api/apiCalls';
import Spinner from "./Spinner";
import HoaxView from "./HoaxView";

class HoaxFeed extends Component {

  state = {
    page: {
      content: []
    },
    isLoadingHoaxes: false,
    newHoaxCount: 0,
    isLoadingOldHoaxes: false,
    isLoadingNewHoaxes: false,
  }

  checkCount = () => {
    const hoaxes = this.state.page.content;
    const topHoaxId = hoaxes.length ? hoaxes[0].id : 0;
    apiCalls.loadNewHoaxCount(topHoaxId, this.props.user)
      .then(response => {
        this.setState({newHoaxCount: response.data.count});
      })
  }

  onClickLoadNew = () => {
    const hoaxes = this.state.page.content;
    const topHoaxId = hoaxes.length ? hoaxes[0].id : 0;
    this.setState({isLoadingNewHoaxes: true});
    apiCalls.loadNewHoaxes(topHoaxId, this.props.user)
      .then(response => {
        const page = {...this.state.page};
        page.content = [...response.data, ...page.content];
        this.setState({page, newHoaxCount: 0, isLoadingNewHoaxes: false});
      })
      .catch(_ => {
        this.setState({isLoadingNewHoaxes: false});
      });
  }

  loadHoaxes = () => {
    this.setState({
      isLoadingHoaxes: true
    });

    apiCalls.loadHoaxes(this.props.user)
      .then(response => {
        this.setState({
          page: response.data,
          isLoadingHoaxes: false
        }, () => {
          this.counterId = setInterval(this.checkCount, 3000);
        });
      });
  };

  onCLickLoadMore = () => {
    const hoaxes = this.state.page.content;
    if (hoaxes.length === 0) {
      return;
    }
    const hoaxAtBottom = hoaxes[hoaxes.length - 1];
    this.setState({isLoadingOldHoaxes: true});
    apiCalls.loadOldHoaxes(hoaxAtBottom.id, this.props.user)
      .then(response => {
        const page = {...this.state.page};
        page.content = [...page.content, ...response.data.content];
        page.last = response.data.last;
        this.setState({page, isLoadingOldHoaxes: false});
      })
      .catch(_ => {
        this.setState({isLoadingOldHoaxes: false});
      });
  }

  componentDidMount() {
    this.loadHoaxes();
  }

  componentWillUnmount() {
    clearInterval(this.counterId);
  }

  render() {
    if (this.state.isLoadingHoaxes) {
      return (
        <Spinner/>
      );
    }

    if (this.state.page.content.length === 0 && this.state.newHoaxCount === 0) {
      return (
        <div className="card card-header text-center">
          There are no hoaxes
        </div>
      );
    }

    return (
      <div>
        {this.state.newHoaxCount > 0 && (
          <div
            style={{cursor: this.state.isLoadingNewHoaxes ? 'not-allowed' : 'pointer'}}
            onClick={!this.state.isLoadingNewHoaxes && this.onClickLoadNew}
            className="card card-header text-center mb-1">
            {this.state.isLoadingNewHoaxes ? <Spinner/> : (
              this.state.newHoaxCount === 1
                ? 'There is 1 new hoax'
                : `There is ${this.state.newHoaxCount} new hoaxes`
            )}
          </div>
        )}
        {this.state.page.content.map(hoax => {
          return <HoaxView key={hoax.id} hoax={hoax}/>
        })}
        {!this.state.page.last && (
          <div
            style={{cursor: this.state.isLoadingOldHoaxes ? 'not-allowed' : 'pointer'}}
            className="card card-header text-center"
            onClick={!this.state.isLoadingOldHoaxes && this.onCLickLoadMore}>
            {this.state.isLoadingOldHoaxes ? <Spinner/> : `Load More`}
          </div>
        )}
      </div>
    );
  }
}

export default HoaxFeed;
