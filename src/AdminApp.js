import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './assets/scss/main.scss';
import {Dashboard} from "./view/admin-ui/dashboard";
import 'react-reflex/styles.css'
import LoginScreen from "./view/common/loginScreen";

const AdminApp = () => {
  return (
      <Router>
        <Switch>
            <Route path="/login">
                <LoginScreen title={"UlteraAdmin"}/>
            </Route>
            <Route path="/">
                <Dashboard title={"UlteraAdmin"}/>
            </Route>
        </Switch>
      </Router>

  );
};

export default AdminApp;
