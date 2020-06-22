import React, {Component} from "react";
import UserList from "../components/UserList";

export class HomePage extends Component {

  render() {
    return (
      <div data-testid="homepage">
        <UserList />
      </div>
    )
  }

}

export default HomePage;
