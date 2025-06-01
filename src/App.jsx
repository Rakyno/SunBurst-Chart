import React from "react";

import SunburstCHART from "./components/SunBurstChart";
import data from "./components/data.json";

const App = () => {
  const initaildata = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Interactive Sunburst Chart
        </h1>
      </div>
      <div className=" flex  flex-row items-center justify-center">
        <SunburstCHART data={initaildata} />
      </div>
    </div>
  );
};

export default App;
