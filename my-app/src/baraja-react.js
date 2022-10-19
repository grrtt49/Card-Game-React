/**
 *  React BarajaJS
 *  A plugin for spreading items in a card-like fashion.
 *
 *  Copyright 2020, Marc S. Brooks (https://mbrooks.info)
 *  Licensed under the MIT license:
 *  http://www.opensource.org/licenses/mit-license.php
 */

 'use strict';

 import React, { createRef }     from 'react';
 import PropTypes from 'prop-types';
 import Baraja    from './baraja';
 import './baraja.css';
 
 /**
  * Provides React Component wrapper.
  */
 class BarajaJS extends React.Component {
    container = createRef();
    cardRefs = [];

   componentDidMount() {
     this.baraja = new Baraja(
       this.container,
       this.props.options
     );
   }
 
   componentDidUpdate(prevProps) {
    this.baraja.getNewCards();
    console.log("Children: ", this.props.children, prevProps.children)
      if (!Object.is(this.props.fan, prevProps.fan)) { // || this.props.children != undefined && prevProps.children != undefined && this.props.children.length != prevProps.children.length) {
        console.log("Trying to fan... ", this.baraja);
       this.baraja.fan(this.props.fan);
     }
     else {
      console.log("Already fanning...");
     }
 
     if (this.props.add !== prevProps.add) {
        this.baraja.add(this.props.add);
     }
 
     if (this.props.close !== prevProps.close) {
       this.baraja.close();
       console.log("Closing!");
     }
 
     if (this.props.last !== prevProps.last) {
       this.baraja.last();
     }
 
     if (this.props.next !== prevProps.next) {
       this.baraja.next();
     }
   }
 
   render() {
     return (
       <ul id={this.props.id} className="baraja-container" ref={this.container}>
         {this.props.children}
       </ul>
     );
   }
 };
 
 BarajaJS.defaultProps = {
   id: 'baraja-js',
   fan: {},
   close: false,
   last: false,
   next: false
 };
 
 BarajaJS.propTypes = {
   id: PropTypes.string,
   options: PropTypes.object,
   fan: PropTypes.object,
  //  add: PropTypes.string,
   close: PropTypes.bool,
   last: PropTypes.bool,
   next: PropTypes.bool
 };
 
 export default BarajaJS;