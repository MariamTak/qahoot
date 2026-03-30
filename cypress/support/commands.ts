declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('ion-input[formcontrolname="email"]')
    .find('input.native-input').type(email);
  cy.get('ion-input[formcontrolname="password"]')
    .find('input.native-input').type(password);
  cy.get('ion-button[type="submit"]').click();
  cy.url().should('include', '/home');
});

export {};