import {
  HashRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import './assets/scss/main.scss';
import {Dashboard} from "./view/app-ui/dashboard";
import LoginScreen from "./view/common/loginScreen/index";
import 'react-reflex/styles.css'
import {ViewWorkItem} from "./view/app-ui/workSearch/ViewWorkItem/ViewWorkItem";

const App = () => {
  return (
      <Router>
        <Switch>
            <Route path="/login">
                <LoginScreen title={"Ultera"}/>
            </Route>
            <Route path="/work-search/work-viewer/:id">
                <ViewWorkItem/>
            </Route>
            <Route path="/">
                <Dashboard title={"Ultera"}/>
            </Route>
        </Switch>
      </Router>

  );
};

export default App;
