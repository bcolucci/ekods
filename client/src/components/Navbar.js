import React from 'react'
import { NavLink } from 'react-router-dom'
import { LinkContainer } from 'react-router-bootstrap'
import { Navbar, Nav, NavItem } from 'react-bootstrap'

import './Navbar.css'

const { Header, Brand, Toggle, Collapse } = Navbar

export default () => (
  <Navbar inverse>
    <Header>
      <Brand>
        <NavLink to='/'>Eko Delivery Service</NavLink>
      </Brand>
      <Toggle />
    </Header>
    <Collapse>
      <Nav>
        <LinkContainer to='/play'>
          <NavItem>Play</NavItem>
        </LinkContainer>
      </Nav>
    </Collapse>
  </Navbar>
)
