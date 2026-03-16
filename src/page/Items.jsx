import React from 'react';
import Navbar from './../components/Navbar';
import Footer from '../components/Footer';
import Item from '../components/Item';

const Items = () => {
  return (
    <div>
      <Navbar />
      <Item /> {/* Handles fetching, search, categories, and cart */}
      <Footer />
    </div>
  );
};

export default Items;