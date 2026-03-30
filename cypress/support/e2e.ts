// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'



describe('Login E2E', () => {

  beforeEach(() => {
    cy.visit('/login');
  });

  it('should display the login form', () => {
    cy.get('ion-input[formcontrolname="email"]').should('exist');
    cy.get('ion-input[formcontrolname="password"]').should('exist');
    cy.get('ion-button[type="submit"]').should('exist');
  });

  it('should login with valid credentials', () => {
    cy.fixture('user').then((user) => {
      cy.get('ion-input[formcontrolname="email"]')
        .find('input.native-input').type(user.email);
      cy.get('ion-input[formcontrolname="password"]')
        .find('input.native-input').type(user.password);
      cy.get('ion-button[type="submit"]').click();
      cy.url().should('include', '/home');
    });
  });

  it('should show error with wrong credentials', () => {
    cy.get('ion-input[formcontrolname="email"]')
      .find('input.native-input').type('wrong@email.com');
    cy.get('ion-input[formcontrolname="password"]')
      .find('input.native-input').type('wrongpassword');
    cy.get('ion-button[type="submit"]').click();
    cy.get('ion-toast').should('be.visible');
  });

  it('should not submit with empty fields', () => {
    cy.get('ion-button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

});