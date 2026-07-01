# RentEase Technical Documentation

## Overview

RentEase is a responsive furniture and appliance rental platform for students and working professionals who need temporary home setups without the cost and friction of ownership.

## Scope

In scope:

- Web-based responsive platform
- Product catalog for furniture and appliances
- Monthly rental plans with tenure options
- Delivery and pickup scheduling
- Active rental and maintenance support workflows
- Admin monitoring for inventory, orders, and disputes

Out of scope:

- Native mobile applications
- Cross-border rentals
- Advanced AI-based pricing
- Second-hand resale marketplace

## Functional Coverage

- User registration, login, and profile management
- Browse products by furniture and appliance categories
- View monthly rent, security deposit, and tenure options
- Add products to cart and place rental orders
- Select delivery date and address
- Track active rentals and request maintenance support
- Admin controls for inventory, user management, and reporting

## Non-Functional Requirements

- Performance target: page load under 3 seconds
- Security target: token-based login and payment-ready backend
- Reliability target: consistent inventory and order tracking
- Usability target: simple mobile-first UI
- Scalability target: support for multi-city expansion

## Data Model Summary

- Users store identity, role, phone, address, and status
- Products store category, monthly rent, security deposit, tenure options, stock, and rating
- Cart stores user-selected items with quantity and tenure
- Orders store delivery details, rent totals, payment status, and rental status
- Maintenance requests store issue type, priority, and resolution metadata

## KPIs

- Active rentals
- Monthly recurring revenue
- Product utilization rate
- Customer retention rate
- Maintenance request resolution time

## Implementation Notes

- Client is built with React and Vite
- Backend is built with Express and MongoDB
- Authentication uses JWT with role-based authorization
- The current frontend includes a catalog preview, admin dashboard summary, and documentation page for the project brief
