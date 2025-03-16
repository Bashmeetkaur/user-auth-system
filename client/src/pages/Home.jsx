import React from 'react';
import '../styles/home.css';

const Home = () => {
  return (
    <div className="container-home">
      <p className="home-heading">Welcome to the User Auth System</p>
      <p className="home-subheading">Please <a href="/login">login</a> or <a href="/register">register</a>.</p>
    </div>
  );
};

export default Home;