import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from "../src/components/Navbar";

const App = () => {
  return (
    <div>
      <Navbar />
       <main className="container mt-4">
        <Outlet />
      </main>
      
    </div>
  );
};

export default App;
