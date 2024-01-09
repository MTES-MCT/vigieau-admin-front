describe('Liste des arrêtés cadres', () => {
  before(() => {
    cy.logout();
    cy.populateDb('arrete-cadre');
  });

  after(() => {
    cy.resetDb('arrete-cadre');
  });

  it(`Un utilisateur DEPARTEMENT doit pouvoir voir et accéder aux arrêtés cadres de son département uniquement`, () => {
    cy.devLogin('test@test.fr');
    cy.url().should('match', /arrete-cadre/);
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').should('exist');
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').each(card => {
      cy.wrap(card).get('.fr-card__desc').contains('Corse-du-Sud');
    })
  });

  it(`Un utilisateur MTE doit pouvoir voir et accéder à tout les arrêtés cadres`, () => {
    cy.devLogin('vincent.laine.utc@gmail.com');
    cy.url().should('match', /arrete-cadre/);
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').should('have.length', 9);
    cy.get('.fr-pagination .fr-pagination__list li').should('have.length', 10);
  });

  it(`Un arrêté cadre doit s'afficher correctement dans le listing`, () => {
    cy.devLogin('vincent.laine.utc@gmail.com');
    cy.url().should('match', /arrete-cadre/);
    
    // Rechercher les bons arrêtés cadres via la recherche
    cy.intercept({
      method: 'GET',
      url: '/api/arrete-cadre/search*',
    }).as('acSearch');
    cy.get('[data-cy=ArreteCadreListSearchBar] input').clear();
    cy.get('[data-cy=ArreteCadreListSearchBar] input').type('CYTEST_001');
    cy.wait('@acSearch');
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').should('have.length', 1);
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').eq(0).find('.fr-card__title').contains('CYTEST_001').should('exist');
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').eq(0).find('.fr-badge').contains('Brouillon').should('exist');
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').eq(0).find('.fr-card__desc').contains('Dep :').should('exist');
    cy.get('[data-cy=ArreteCadreList] [data-cy=ArreteCadreListCard]').eq(0).find('.fr-card__detail').contains('2024-01-01').should('exist');
    // Checker les actions possibles
    // Checker arrêté abrogé
  });
});