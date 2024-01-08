Cypress.Commands.add('logout', () => {
  cy.clearAllLocalStorage();
  cy.clearAllCookies();
  cy.visit('/');
  cy.url().should('match', /connexion/);
});

Cypress.Commands.add('devLogin', () => {
  cy.logout();
  cy.get('.fr-select').select(1)
  cy.get('[data-cy=LoginDevBtn]').click();
  cy.url().should('match', /arrete-cadre/);
});