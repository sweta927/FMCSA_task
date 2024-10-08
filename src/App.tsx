import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PivotTable from "./components/PivotView/PivotView";
import DataView from "./components/DataView/DataView";
import Layout from "./components/Sidebar/Sidebar";
import Sidebar from "./components/Sidebar/Sidebar";
import PivotView from "./components/PivotView/PivotView";

const App: React.FC = () => {
  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route path="/" element={<DataView />} />
        <Route path="/pivotTable" element={<PivotView />} />
      </Routes>
    </Router>
  );
};

export default App;
