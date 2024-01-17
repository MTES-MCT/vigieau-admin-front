describe('Création d\'un arrêtés cadres', () => {

  after(() => {
    cy.resetDb('arrete-cadre');
  });
  
  const acNumero = `CYTEST${Math.floor(Math.random() * 10000)}`;
  
  describe('En tant que département', () => {
    it(`Je peux créer un AC uniquement sur mon département`, () => {
      cy.devLogin(Cypress.env('departementUser')); 
      cy.get('[data-cy=ArreteCadreListAddBtn]').click();
      cy.location('pathname').should('equal', '/arrete-cadre/nouveau/edition');
      cy.get('h1').contains(`Création d'un arrêté cadre`).should('exist');
      
      // Je ne peux pas passer à l'étape suivante sans avoir validé le formulaire courant
    });
  });

  describe('En tant que MTE', () => {
    it(`Je peux créer un AC sur n'importe quel département`, () => {
      // cy.devLogin(Cypress.env('mteUse'));
    });
  });
});