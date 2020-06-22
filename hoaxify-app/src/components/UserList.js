import React, {Component} from "react";
import * as apiCalls from '../api/apiCalls';
import UserListItem from "./UserListItem";

class UserList extends Component {

  state = {
    page: {
      content: [],
      number: 0,
      size: 3
    }
  }

  onClickNext = () => {
    this.loadData(this.state.page.number + 1);
  }

  onClickPrevious = () => {
    this.loadData(this.state.page.number - 1);
  }

  loadData = (requestedPage = 0) => {
    apiCalls
      .listUsers({
        page: requestedPage,
        size: this.state.page.size
      })
      .then((response) => {
          this.setState({
            page: response.data,
            loadError: undefined
          });
        }
      ).catch(error => {
        this.setState({loadError: 'User load failed'})
    });
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    return (
      <div>
        {this.state.page && this.state.page.content && (
          <div className="card">
            <h3 className="card-title bg-primary m-0 py-1 text-center text-white">
              Users
            </h3>
            <div className="list-group list-group-flush" data-testid="usergroup">
              {this.state.page.content.map(user => <UserListItem key={user.username} user={user}/>)}
            </div>
            <div className="py-2 clearfix">
              {!this.state.page.first && (
                <button
                  className="btn btn-sm btn-primary float-left ml-2"
                  onClick={this.onClickPrevious}>
                  &laquo; Previous
                </button>
              )}
              {!this.state.page.last && (
                <button
                  className="btn btn-sm btn-primary float-right mr-2"
                  onClick={this.onClickNext}>
                  Next &raquo;
                </button>
              )}
              {this.state.loadError && (<div className="text-center text-danger">{this.state.loadError}</div>)}
            </div>
          </div>
        )}
      </div>
    )
  }
}

export default UserList;
