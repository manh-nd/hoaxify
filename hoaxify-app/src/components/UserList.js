import React, {Component} from "react";
import * as apiCalls from '../api/apiCalls';
import UserListItem from "./UserListItem";
import './UserList.css';

class UserList extends Component {

  state = {
    page: {
      content: [],
      number: 0,
      size: 3
    },
    isLoadingData: true
  }

  onClickNext = () => {
    this.loadData(this.state.page.number + 1);
  }

  onClickPrevious = () => {
    this.loadData(this.state.page.number - 1);
  }

  loadData = (requestedPage = 0) => {
    this.setState({isLoadingData: true})
    apiCalls
      .listUsers({
        page: requestedPage,
        size: this.state.page.size
      })
      .then((response) => {
          this.setState({
            page: response.data,
            loadError: undefined,
            isLoadingData: false
          });
        }
      ).catch(error => {
      this.setState({loadError: 'User load failed', isLoadingData: false})
    });
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const hasContent = this.state.page && this.state.page.content;
    if(!hasContent) {
      return (
        <div className="card">
          <h3 className="card-title bg-primary m-0 py-1 text-center text-white">
            Users
          </h3>
          <div className="card-body">
            There is no user available.
          </div>
        </div>
      );
    } else {
      return (
        <div className="card">
          <h3 className="card-title bg-primary m-0 py-1 text-center text-white">
            Users
          </h3>
          <div className="card-body overlay-container">
            {this.state.isLoadingData && (
              <div className="overlay">
                <div className="d-flex justify-content-center align-items-center h-100 text-back-50">
                  <div className="spinner-border">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              </div>
            )}
            <div className="list-group" data-testid="usergroup">
              {this.state.page.content.map(user => <UserListItem key={user.username} user={user}/>)}
            </div>
            {
              <div className="py-2 clearfix">
                {!this.state.page.first && (
                  <button
                    style={{display: this.state.page.content.length ? '': 'none'}}
                    className="btn btn-sm btn-primary float-left"
                    onClick={this.onClickPrevious}>
                    &laquo; Previous
                  </button>
                )}
                {!this.state.page.last && (
                  <button
                    style={{display: this.state.page.content.length ? '': 'none'}}
                    className="btn btn-sm btn-primary float-right"
                    onClick={this.onClickNext}>
                    Next &raquo;
                  </button>
                )}
                {this.state.loadError && (<div className="text-center text-danger">{this.state.loadError}</div>)}
              </div>
            }
          </div>
        </div>
      )
    }
  }
}

export default UserList;
