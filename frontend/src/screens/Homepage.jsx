import React from 'react'
import Header from '../components/Header';
import Hero from '../components/Hero';
import Features from '../components/Features';
import App from '../components/App';
import Benefits from '../components/Benefits';
import About from '../components/About';
import Contact from '../components/Contact';

const Homepage = () => {
  return (
    <div>
      <Header />
      <Hero />
      <Features />
      <App />
      <Benefits />
      <About />
      <Contact />
    </div>
  )
}

export default Homepage
