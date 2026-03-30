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


  it('should not submit with empty fields', () => {
    cy.get('ion-button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

});