import "./App.css";
import { BrowserRouter } from "react-router-dom";
import Pages from "./features/Pages/Pages";
import { Provider } from "react-redux";
import { reduxStore } from "./features/Redux/Store";

function App() {
  return (
    <div className="App">
      <Provider store={reduxStore}>
        <BrowserRouter>
          <Pages />
        </BrowserRouter>
      </Provider>
    </div>
  );
}

export default App;
